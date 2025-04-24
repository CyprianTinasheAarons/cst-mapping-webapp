"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { JuroContractCreator } from "@/components/juro/juroContractCreator";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchJuroTemplates,
  fetchJuroTemplate,
  createJuroContract,
  sendContractForSigning,
  downloadContractPdf,
  autofillContract,
  clearAutofilledContract
} from "@/slices/juro/juroSlice";
import { fetchHaloTicketById } from "@/slices/halo/haloSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  ArrowLeft, 
  FileText, 
  Send, 
  Download, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  Bug
} from "lucide-react";
import Link from "next/link";

interface TemplateField {
  title: string;
  type: string;
  uid: string;
  value?: string;
}

interface TemplateQuestion {
  fieldUid: string;
  isRequired: boolean;
  signingSideUids: string[];
  text: string;
  title: string;
  uid: string;
}

export default function CreateDocumentPage() {
  const searchParams = useSearchParams();
  const rawTicketId = searchParams.get("ticket_id");
  
  // Fix the ticket ID parsing to handle values like {0717670}
  const ticketId = rawTicketId 
    ? parseInt(rawTicketId.replace(/[{}]/g, '').replace(/^0+/, ''), 10) || null 
    : null;
  
  const templateIdFromUrl = searchParams.get("template_id")
    ? searchParams.get("template_id")?.replace(/[{}]/g, '')
    : null;
  
  // Debug logger
  const debugLog = useCallback((stage: string, data: any) => {
    console.log(`[DEBUG:${stage}]`, data);
    toast.info(`🐞 ${stage}: ${typeof data === 'object' ? JSON.stringify(data).substring(0, 50) + '...' : data}`, {
      autoClose: 3000,
      position: "bottom-right",
      className: "debug-toast",
    });
  }, []);
  
  // Step tracking
  const [currentStep, setCurrentStep] = useState(1); // 1: Template Selection, 2: Form Filling
  
  // Loading states
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isTicketLoading, setIsTicketLoading] = useState(true);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(true);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [isCreatingDocument, setIsCreatingDocument] = useState(false);
  const [isSendingForSigning, setIsSendingForSigning] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAddingToAllops, setIsAddingToAllops] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  
  // State for the template selection
  const [selectedTemplate, setSelectedTemplate] = useState("");
  
  // States for document creation
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [documentFields, setDocumentFields] = useState<Record<string, string>>({});
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([]);
  const [templateQuestions, setTemplateQuestions] = useState<TemplateQuestion[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [createdDocumentId, setCreatedDocumentId] = useState<string | null>(null);
  const [documentCreated, setDocumentCreated] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [documentUrl, setDocumentUrl] = useState("");
  const [selectedSignatureProvider, setSelectedSignatureProvider] = useState("docusign");

  // Caching
  const [templateCache, setTemplateCache] = useState<Record<string, any>>({});
  
  const dispatch = useAppDispatch();
  const { 
    templates: juroTemplates, 
    status: juroStatus,
    autofilledContract
  } = useAppSelector((state) => state.juro);
  const { ticketById: detailedTicketData, status: haloStatus } = useAppSelector((state) => state.halo);

  // Helper function to get the associated question for a field
  const getQuestionForField = useCallback((fieldUid: string) => {
    return templateQuestions.find(q => q.fieldUid === fieldUid);
  }, [templateQuestions]);

  // Helper to group fields by category
  const groupFieldsByCategory = useCallback(() => {
    const groups: Record<string, TemplateField[]> = {
      client: [],
      company: [],
      contract: [],
      signatory: [],
      other: []
    };

    templateFields.forEach(field => {
      const title = field.title.toLowerCase();
      
      if (title.includes('client') || title.includes('counterparty') || title.includes('customer')) {
        groups.client.push(field);
      } else if (title.includes('company') || title.includes('cst') || title.includes('organization')) {
        groups.company.push(field);
      } else if (title.includes('contract') || title.includes('quote') || title.includes('agreement')) {
        groups.contract.push(field);
      } else if (title.includes('signatory') || title.includes('signature') || title.includes('signing')) {
        groups.signatory.push(field);
      } else {
        groups.other.push(field);
      }
    });

    // Filter out empty groups
    return Object.fromEntries(
      Object.entries(groups).filter(([_, fields]) => fields.length > 0)
    );
  }, [templateFields]);

  // Simplify the loadTemplateDetails function
  const loadTemplateDetails = useCallback((templateId: string) => {
    setIsLoadingTemplate(true);
    debugLog("Loading Template", `Template ID: ${templateId}`);
    
    // If we already have the template in cache, use it
    if (templateCache[templateId]) {
      debugLog("Template Cache Hit", `Using cached template: ${templateId}`);
      console.log(`Using cached template: ${templateId}`);
      // Only set basic template structure - autofill will handle the values
      setTemplateFields(templateCache[templateId].fields || []);
      setTemplateQuestions(templateCache[templateId].questions || []);
      setIsLoadingTemplate(false);
      return;
    }

    // Fetch the template from the API
    debugLog("Template API Call", `Fetching template: ${templateId}`);
    dispatch(fetchJuroTemplate(templateId))
      .unwrap()
      .then((template) => {
        debugLog("Template Loaded", `Template name: ${template.name}`);
        // Cache the template for future use
        setTemplateCache((prev) => ({
          ...prev,
          [templateId]: template,
        }));
        
        // Only set basic template structure - autofill will handle the values
        setTemplateFields(template.fields || []);
        setTemplateQuestions(template.questions || []);
        setIsLoadingTemplate(false);
      })
      .catch((error) => {
        console.error(`Error loading template ${templateId}:`, error);
        debugLog("Template Error", `Failed to load template: ${error.message || JSON.stringify(error)}`);
        toast.error("Failed to load template details");
        setIsLoadingTemplate(false);
      });
  }, [dispatch, templateCache, debugLog]);

  // Create a shared function for autofill logic to avoid duplication
  const performAutofill = useCallback((templateId: string) => {
    if (!templateId || !ticketId) {
      debugLog("Autofill Failed", `Missing data - Template ID: ${templateId}, Ticket ID: ${ticketId}`);
      return Promise.reject("Missing template ID or ticket ID");
    }
    
    setIsLoadingTemplate(true);
    setIsAutofilling(true);
    debugLog("Autofill Started", `Template: ${templateId}, Ticket: ${ticketId}`);
    
    // Clear any previous autofilled data
    dispatch(clearAutofilledContract());
    
    const autofillData = {
      template_id: templateId,
      ticket_id: ticketId
    };
    
    debugLog("Autofill Dispatch", autofillData);
    // Use the autofill function to intelligently populate fields
    return dispatch(autofillContract(autofillData))
      .unwrap()
      .then(result => {
        if (result) {
          debugLog("Autofill Success", `Fields count: ${result.fields?.length || 0}`);
          console.log("Autofill completed successfully:", result);
          toast.success("Successfully auto-filled template with ticket data");
          
          // Set document title based on template name
          setDocumentTitle(`${result.name || 'Contract'} - ${detailedTicketData?.oppcompanyname || 'Client'}`);
          
          // Extract fields from the autofilled contract
          if (result.fields) {
            setTemplateFields(result.fields);
            
            // Convert fields to documentFields format
            const newDocumentFields: Record<string, string> = {};
            result.fields.forEach((field: TemplateField) => {
              if (field.value !== undefined) {
                newDocumentFields[field.uid] = field.value;
              }
            });
            setDocumentFields(newDocumentFields);
          }
          
          // Extract questions
          if (result.questions) {
            setTemplateQuestions(result.questions);
          }
          
          // Move to next step
          setCurrentStep(2);
          return result;
        }
        debugLog("Autofill Empty", "No result data received");
        toast.warn("Auto-fill completed but no data was returned");
        return null;
      })
      .catch(error => {
        console.error("Error auto-filling template:", error);
        debugLog("Autofill Error", `${error.message || JSON.stringify(error)}`);
        toast.error("Failed to auto-fill template with ticket data.");
        
        // Fall back to regular template loading
        loadTemplateDetails(templateId);
        throw error;
      })
      .finally(() => {
        setIsLoadingTemplate(false);
        setIsAutofilling(false);
      });
  }, [ticketId, detailedTicketData, dispatch, loadTemplateDetails, debugLog]);

  // Process template selection with autofill - use the shared function
  const handleTemplateSelection = useCallback((templateId: string) => {
    setSelectedTemplate(templateId);
    debugLog("Template Selected", templateId);
    
    if (!templateId) {
      debugLog("Template Selection Cancelled", "No template selected");
      setCurrentStep(1);
      return;
    }
    
    // Check if ticketId is valid before trying to use it
    if (ticketId) {
      debugLog("Ticket Found", `Will try autofill with template ${templateId} and ticket ${ticketId}`);
      toast.info(`Starting autofill for template ${templateId} with ticket ${ticketId}`);
      performAutofill(templateId).catch(err => {
        debugLog("Template Selection Error", `Failed to handle template selection: ${err.message || JSON.stringify(err)}`);
        console.error("Failed to handle template selection:", err);
      });
    } else {
      debugLog("No Ticket ID for Autofill", `Ticket value: ${rawTicketId} parsed to ${ticketId}`);
      toast.warning("No valid ticket ID found. Autofill cannot be performed.");
      // If no ticket ID is provided, load the template details normally
      loadTemplateDetails(templateId);
    }
  }, [ticketId, rawTicketId, performAutofill, loadTemplateDetails, debugLog]);

  // Auto-select template and autofill if template_id is provided in URL
  useEffect(() => {
    debugLog("URL Params Check", {
      templateIdFromUrl,
      ticketId,
      hasDetailedTicketData: !!detailedTicketData,
      allConditionsMet: !!(templateIdFromUrl && ticketId && detailedTicketData)
    });
    
    if (templateIdFromUrl && ticketId && detailedTicketData) {
      debugLog("URL Params", `Template: ${templateIdFromUrl}, Ticket: ${ticketId}`);
      setSelectedTemplate(templateIdFromUrl);
      toast.info(`Auto-selecting template ${templateIdFromUrl} from URL`);
      performAutofill(templateIdFromUrl).catch(err => {
        debugLog("Autofill Error on Page Load", `Failed to auto-fill on page load: ${err.message || JSON.stringify(err)}`);
        console.error("Failed to auto-fill on page load:", err);
      });
    } else {
      // Log why autofill wasn't triggered from URL
      const missingParams = [];
      if (!templateIdFromUrl) missingParams.push("template ID");
      if (!ticketId) missingParams.push("ticket ID");
      if (!detailedTicketData) missingParams.push("ticket data");
      
      if (missingParams.length > 0) {
        debugLog("Autofill Not Triggered", `Missing: ${missingParams.join(", ")}`);
      }
    }
  }, [templateIdFromUrl, ticketId, detailedTicketData, performAutofill, debugLog]);

  // Initial data loading
  useEffect(() => {
    debugLog("Initial Load", `Page initialized with URL params: ${window.location.search}`);
    debugLog("Raw Ticket ID", `Value: "${rawTicketId}", Type: ${typeof rawTicketId}`);
    debugLog("Parsed Ticket ID", `Value: ${ticketId}, Type: ${typeof ticketId}`);
    
    if (ticketId) {
      setIsTicketLoading(true);
      debugLog("Fetching Ticket", `Ticket ID: ${ticketId}`);
      dispatch(fetchHaloTicketById(ticketId))
        .unwrap()
        .then((data) => {
          debugLog("Ticket Loaded", `Company: ${data?.oppcompanyname}`);
          setIsTicketLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching ticket:", error);
          debugLog("Ticket Error", `Failed to fetch ticket: ${error.message || JSON.stringify(error)}`);
          toast.error("Error loading ticket details");
          setIsTicketLoading(false);
        });
    } else {
      debugLog("No Ticket ID", "Skipping ticket fetch");
      setIsTicketLoading(false);
    }

    setIsTemplatesLoading(true);
    debugLog("Fetching Templates", "Loading available document templates");
    dispatch(fetchJuroTemplates())
      .unwrap()
      .then((templates) => {
        debugLog("Templates Loaded", `Count: ${templates?.length || 0}`);
        setIsTemplatesLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching templates:", error);
        debugLog("Template List Error", `Failed to fetch templates: ${error.message || JSON.stringify(error)}`);
        toast.error("Error loading document templates");
        setIsTemplatesLoading(false);
      });
      
    setIsPageLoading(false);
  }, [dispatch, ticketId, rawTicketId, debugLog]);

  // Handle field change
  const handleFieldChange = (fieldId: string, value: string) => {
    setDocumentFields(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error when field is updated
    if (fieldErrors[fieldId]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleTitleChange = (value: string) => {
    setDocumentTitle(value);
    
    // Clear validation error for document title if it exists
    if (fieldErrors["document-title"]) {
      const updatedErrors = { ...fieldErrors };
      delete updatedErrors["document-title"];
      setFieldErrors(updatedErrors);
    }
  };

  // Remove any hardcoded field handling in validateFields
  const validateFields = useCallback(() => {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};
    
    // Validate required fields
    templateQuestions.forEach(question => {
      if (question.isRequired && question.fieldUid) {
        const fieldValue = documentFields[question.fieldUid];
        if (!fieldValue) {
          const field = templateFields.find(f => f.uid === question.fieldUid);
          const fieldName = field?.title || question.title || 'Unknown field';
          errors.push(`${fieldName} is required`);
          fieldErrors[question.fieldUid] = 'This field is required';
        }
      }
    });
    
    // Also check special fields that are always required
    const requiredSpecialFields = ['signatory_name', 'signatory_email'];
    requiredSpecialFields.forEach(fieldUid => {
      if (!documentFields[fieldUid]) {
        errors.push(`${fieldUid.replace('_', ' ')} is required`);
        fieldErrors[fieldUid] = 'This field is required';
      }
    });
    
    setValidationErrors(errors);
    setFieldErrors(fieldErrors);
    
    return errors.length === 0;
  }, [documentFields, templateFields, templateQuestions]);

  // Create the contract with proper data
  const createContract = useCallback(() => {
    if (!validateFields()) {
      debugLog("Validation Failed", `Errors: ${validationErrors.join(', ')}`);
      toast.error("Please fix the validation errors before creating the document");
      return;
    }

    setIsCreatingDocument(true);
    debugLog("Creating Document", `Template: ${selectedTemplate}, Fields: ${Object.keys(documentFields).length}`);
    
    // Use JuroContractCreator to generate the proper payload
    const contractData = JuroContractCreator.createContractPayload(
      selectedTemplate,
      documentTitle,
      documentFields,
      templateFields,
      templateQuestions,
      detailedTicketData // Using ticket data as the selected client
    );

    debugLog("Contract Data", contractData);
    
    dispatch(createJuroContract(contractData))
      .unwrap()
      .then((data) => {
        debugLog("Document Created", `Document ID: ${data.id}`);
        setCreatedDocumentId(data.id);
        setDocumentCreated(true);
        setShowSuccessDialog(true);
        setDocumentUrl(data.viewUrl || '');
        toast.success("Document created successfully!");
      })
      .catch((error) => {
        const errorMessage = error.message || "Unknown error";
        debugLog("Document Creation Error", errorMessage);
        console.error("Error creating document:", error);
        toast.error(`Failed to create document: ${errorMessage}`);
      })
      .finally(() => {
        setIsCreatingDocument(false);
      });
  }, [
    validateFields, 
    validationErrors, 
    selectedTemplate, 
    documentFields, 
    documentTitle, 
    templateFields,
    templateQuestions,
    detailedTicketData,
    dispatch,
    debugLog
  ]);

  // Handle send for signing
  const handleSendForSigning = async () => {
    if (!createdDocumentId) {
      toast.error("No document ID found. Please create a document first.");
      return;
    }

    setIsSendingForSigning(true);
    try {
      // Use JuroContractCreator to create the signing request payload
      const signingData = JuroContractCreator.createSigningRequest(
        documentFields,
        templateFields,
        detailedTicketData, // As the selected client
        detailedTicketData, // As detailed client data
        selectedSignatureProvider
      );

      debugLog("Sending for Signing", signingData);
      
      // We need to use the specific signing UID - using the constant from JuroContractCreator
      const signingUid = JuroContractCreator.COUNTERPARTY_SIDE_UID;
      
      const result = await dispatch(
        sendContractForSigning({
          contractId: createdDocumentId,
          signingUid,
          data: signingData
        })
      ).unwrap();

      toast.success("Document sent for signing!");
      debugLog("Sent for Signing", result);
    } catch (error: any) {
      toast.error(`Failed to send for signing: ${error.message || "Unknown error"}`);
      debugLog("Signing Error", error);
    } finally {
      setIsSendingForSigning(false);
    }
  };

  // Handle download document
  const handleDownloadDocument = async () => {
    if (!createdDocumentId) {
      toast.error("Please create the document first");
      return;
    }

    setIsDownloading(true);

    try {
      const response = await dispatch(downloadContractPdf(createdDocumentId)).unwrap();
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Document downloaded successfully");
    } catch (error: any) {
      console.error("Error downloading document:", error);
      toast.error(`Failed to download document: ${error.message || "Unknown error"}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle add to Allops
  const handleAddToAllops = async () => {
    if (!createdDocumentId || !documentTitle || !detailedTicketData) {
      toast.error("Missing required information to add to Allops");
      return;
    }

    setIsAddingToAllops(true);
    try {
      // This would be a real API call in production
      // Simulating an API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success(`Added "${documentTitle}" to Allops successfully`);
    } catch (error: any) {
      toast.error(`Failed to add to Allops: ${error.message || "Unknown error"}`);
    } finally {
      setIsAddingToAllops(false);
    }
  };

  // Render template field
  const renderTemplateField = useCallback((field: TemplateField) => {
    const question = getQuestionForField(field.uid);
    const hasError = fieldErrors[field.uid] !== undefined;
    // Create default placeholder text instead of using field.placeholder which doesn't exist
    const placeholderText = `Enter ${field.title.toLowerCase()}`;
    
    // Determine if field is related to specific categories for styling
    const isClientField = field.title.toLowerCase().includes('client') || 
                         field.title.toLowerCase().includes('counterparty') || 
                         field.title.toLowerCase().includes('customer');
    const isCompanyField = field.title.toLowerCase().includes('company') || 
                          field.title.toLowerCase().includes('cst') || 
                          field.title.toLowerCase().includes('organization');
    const isDateField = field.type === 'date' || field.title.toLowerCase().includes('date');
    const isSignatoryField = field.title.toLowerCase().includes('signatory') || 
                            field.title.toLowerCase().includes('signing') || 
                            field.title.toLowerCase().includes('signature');
    const isEmailField = field.title.toLowerCase().includes('email');
    const isMonetaryField = field.title.toLowerCase().includes('price') || 
                           field.title.toLowerCase().includes('cost') ||
                           field.title.toLowerCase().includes('fee') ||
                           field.title.toLowerCase().includes('amount') ||
                           field.title.toLowerCase().includes('value');
    
    // Determine field styling based on category
    const fieldStyle = isClientField ? 'border-l-4 border-l-blue-400 pl-2' :
                      isCompanyField ? 'border-l-4 border-l-purple-400 pl-2' :
                      isSignatoryField ? 'border-l-4 border-l-amber-400 pl-2' :
                      isDateField ? 'border-l-4 border-l-green-400 pl-2' :
                      '';

    return (
      <div key={field.uid} className={`mb-6 rounded-md p-3 transition-colors ${hasError ? 'bg-red-50' : 'hover:bg-slate-50'} ${fieldStyle}`}>
        <div className="flex flex-col space-y-1.5 mb-2">
          <Label htmlFor={field.uid} className="text-md font-medium flex items-center">
            {field.title}
            {question?.isRequired && <span className="text-red-500 ml-1">*</span>}
            {isClientField && <Badge variant="outline" className="ml-2 bg-blue-50">Client</Badge>}
            {isCompanyField && <Badge variant="outline" className="ml-2 bg-purple-50">Company</Badge>}
            {isSignatoryField && <Badge variant="outline" className="ml-2 bg-amber-50">Signatory</Badge>}
          </Label>
          {question?.text && (
            <p className="text-sm text-muted-foreground">{question.text}</p>
          )}
        </div>
        <div>
          {field.type === 'textarea' ? (
            <Textarea
              id={field.uid}
              value={documentFields[field.uid] || ''}
              onChange={(e) => handleFieldChange(field.uid, e.target.value)}
              className={`w-full ${hasError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
              placeholder={placeholderText}
              rows={4}
            />
          ) : isDateField ? (
            <div className="relative">
              <Input
                id={field.uid}
                type="date"
                value={documentFields[field.uid] || ''}
                onChange={(e) => handleFieldChange(field.uid, e.target.value)}
                className={`w-full ${hasError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
              />
            </div>
          ) : field.title.toLowerCase().includes('companies house') ? (
            <div>
              <div className="relative">
                <Input
                  id={field.uid}
                  type="text"
                  value={documentFields[field.uid] || ''}
                  onChange={(e) => handleFieldChange(field.uid, e.target.value)}
                  className={`w-full ${hasError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  placeholder="Enter company number"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Find on <a href="https://find-and-update.company-information.service.gov.uk/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Companies House</a>
              </p>
            </div>
          ) : isEmailField ? (
            <div className="relative">
              <Input
                id={field.uid}
                type="email"
                value={documentFields[field.uid] || ''}
                onChange={(e) => handleFieldChange(field.uid, e.target.value)}
                className={`w-full ${hasError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                placeholder="email@example.com"
              />
            </div>
          ) : isMonetaryField ? (
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
              <Input
                id={field.uid}
                type="text"
                value={documentFields[field.uid] || ''}
                onChange={(e) => handleFieldChange(field.uid, e.target.value)}
                className={`w-full pl-7 ${hasError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                placeholder={placeholderText}
              />
            </div>
          ) : (
            <div className="relative">
              <Input
                id={field.uid}
                type="text"
                value={documentFields[field.uid] || ''}
                onChange={(e) => handleFieldChange(field.uid, e.target.value)}
                className={`w-full ${hasError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                placeholder={placeholderText}
              />
            </div>
          )}
          {hasError && (
            <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors[field.uid]}</p>
          )}
        </div>
      </div>
    );
  }, [documentFields, fieldErrors, getQuestionForField]);
  
  // Group and render fields by category for better organization
  const renderFieldsByGroups = useCallback(() => {
    const groupedFields = groupFieldsByCategory();
    
    return (
      <div className="space-y-8">
        {Object.entries(groupedFields).map(([category, fields]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-semibold capitalize mb-4 border-b pb-2">
              {category === 'client' && 'Client Information'}
              {category === 'company' && 'Company Information'}
              {category === 'contract' && 'Contract Details'}
              {category === 'signatory' && 'Signatory Information'}
              {category === 'other' && 'Additional Information'}
            </h3>
            <div className="space-y-1">
              {fields.map(field => renderTemplateField(field))}
            </div>
          </div>
        ))}
      </div>
    );
  }, [groupFieldsByCategory, renderTemplateField]);
  
  // Load templates
  useEffect(() => {
    setIsTemplatesLoading(true);
    dispatch(fetchJuroTemplates())
      .unwrap()
      .then(() => {
        setIsTemplatesLoading(false);
        setIsPageLoading(false);
      })
      .catch((error) => {
        console.error("Error loading templates:", error);
        toast.error("Failed to load templates.");
        setIsTemplatesLoading(false);
        setIsPageLoading(false);
      });
  }, [dispatch]);

  // Overall page loading state
  useEffect(() => {
    if (!isTicketLoading && !isTemplatesLoading) {
      setIsPageLoading(false);
    }
  }, [isTicketLoading, isTemplatesLoading]);

  return (
    <div className="container max-w-5xl py-10">
      <ToastContainer position="top-right" autoClose={5000} />
      
      {/* Debug Status Bar */}
      <div className="bg-slate-100 p-2 mb-4 rounded-md text-xs">
        <div className="flex flex-wrap gap-2">
          <Badge variant={isPageLoading ? "destructive" : "secondary"} className="py-1">
            Page: {isPageLoading ? 'Loading' : 'Ready'}
          </Badge>
          <Badge variant={isTicketLoading ? "destructive" : ticketId ? "secondary" : "outline"} className="py-1">
            Ticket: {isTicketLoading ? 'Loading' : ticketId ? `#${ticketId}` : 'No Ticket'}
          </Badge>
          <Badge variant={isTemplatesLoading ? "destructive" : "secondary"} className="py-1">
            Templates: {isTemplatesLoading ? 'Loading' : `${juroTemplates.length} Available`}
          </Badge>
          <Badge variant={isLoadingTemplate ? "destructive" : "default"} className="py-1">
            Template: {isLoadingTemplate ? 'Loading' : selectedTemplate ? 'Selected' : 'None'}
          </Badge>
          <Badge variant={isAutofilling ? "destructive" : autofilledContract ? "secondary" : "default"} className="py-1">
            Autofill: {isAutofilling ? 'In Progress' : autofilledContract ? 'Complete' : 'Not Started'}
          </Badge>
          <Badge variant={isCreatingDocument ? "destructive" : documentCreated ? "secondary" : "default"} className="py-1">
            Document: {isCreatingDocument ? 'Creating' : documentCreated ? 'Created' : 'Not Created'}
          </Badge>
        </div>
        <div className="mt-2">
          <p className="font-mono">URL Params: {JSON.stringify({templateId: templateIdFromUrl, ticketId: rawTicketId})}</p>
        </div>
      </div>

      {isPageLoading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-lg">Loading document creator...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Back button */}
          <div className="mb-6">
            <Link href="/juro" className="flex items-center text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Juro Dashboard
            </Link>
          </div>
          
          <h1 className="text-2xl font-bold mb-6">Create Document</h1>
          
          {/* Ticket Information Banner */}
          {detailedTicketData && (
            <Alert className="mb-6">
              <AlertTitle className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Creating document for: {detailedTicketData.oppcompanyname || detailedTicketData.client_name || "Unknown Company"}
              </AlertTitle>
              <AlertDescription>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <span className="block">Ticket ID: {ticketId}</span>
                    {detailedTicketData.oppcontactname && <span className="block">Contact: {detailedTicketData.oppcontactname}</span>}
                    {detailedTicketData.oppemailaddress && <span className="block">Email: {detailedTicketData.oppemailaddress}</span>}
                    {detailedTicketData.opptel && <span className="block">Phone: {detailedTicketData.opptel}</span>}
                  </div>
                  <div>
                    {detailedTicketData.oppvalue && <span className="block">Quote Value: £{detailedTicketData.oppvalue}</span>}
                    {detailedTicketData.respondbydate && <span className="block">Respond By: {new Date(detailedTicketData.respondbydate).toLocaleDateString()}</span>}
                    {detailedTicketData.opptype && <span className="block">Type: {detailedTicketData.opptype}</span>}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Step 1: Template Selection */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Select Document Template</CardTitle>
                <CardDescription>
                  Choose a template to create your document
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isTemplatesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 border rounded-lg animate-pulse">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
                            <div className="h-10 bg-gray-100 rounded w-full"></div>
                          </div>
                          <div className="h-6 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {juroTemplates.map((template) => (
                      <div 
                        key={template.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedTemplate === template.id 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => handleTemplateSelection(template.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{template.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {template.description || "No description available"}
                            </p>
                          </div>
                          <Badge variant={template.status === 'active' ? 'default' : 'outline'}>
                            {template.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {juroTemplates.length === 0 && (
                      <div className="text-center py-8">
                        <p>No templates available. Please create templates in Juro first.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={() => setCurrentStep(2)} 
                  disabled={!selectedTemplate || isLoadingTemplate}
                >
                  {isLoadingTemplate ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading Template...
                    </>
                  ) : (
                    "Continue to Document Fields"
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {/* Step 2: Form Filling */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Document Information</CardTitle>
                  <CardDescription>Enter the basic information for your document</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="document-title" className="text-base font-medium">
                          Document Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="document-title"
                          placeholder="Enter document title"
                          value={documentTitle}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          className={fieldErrors["document-title"] ? "border-red-500 ring-1 ring-red-500" : ""}
                        />
                        {fieldErrors["document-title"] && (
                          <p className="text-red-500 text-xs">{fieldErrors["document-title"]}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="document-description" className="text-base font-medium">Description</Label>
                        <Textarea
                          id="document-description"
                          placeholder="Enter document description (optional)"
                          value={documentDescription}
                          onChange={(e) => setDocumentDescription(e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Document Details</CardTitle>
                  <CardDescription>Fill in the required fields for this document template</CardDescription>
                </CardHeader>
                <CardContent>
                  {validationErrors.length > 0 && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Validation Errors</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          {validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {templateFields.length > 0 ? (
                    renderFieldsByGroups()
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No fields available for this template.</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentStep(1);
                      setSelectedTemplate("");
                    }}
                  >
                    Back to Templates
                  </Button>
                  <div className="flex space-x-2">
                    <Button
                      variant="default"
                      onClick={createContract}
                      disabled={isCreatingDocument}
                    >
                      {isCreatingDocument ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          Create Document
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          )}
          
          {/* Success Dialog */}
          <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  Document Created Successfully
                </DialogTitle>
                <DialogDescription>
                  Your document has been created and is ready for further action.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <p className="font-medium">{documentTitle}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Document ID: {createdDocumentId}
                </p>
                
                <div className="flex items-center space-x-2 mb-2">
                  <ExternalLink className="h-4 w-4" />
                  <a 
                    href={documentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Open document in Juro
                  </a>
                </div>
              </div>
              
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  className="sm:flex-1" 
                  onClick={handleDownloadDocument}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
                <Button 
                  className="sm:flex-1" 
                  onClick={handleSendForSigning}
                  disabled={isSendingForSigning}
                >
                  {isSendingForSigning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send for Signing
                    </>
                  )}
                </Button>
                <Button 
                  className="sm:flex-1" 
                  onClick={handleAddToAllops}
                  disabled={isAddingToAllops}
                >
                  {isAddingToAllops ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding to Allops...
                    </>
                  ) : (
                    "Add to Allops"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
