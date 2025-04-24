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
} from "@/slices/juro/juroSlice";
import { fetchHaloClientById } from "@/slices/halo/haloSlice";
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
  const clientId = searchParams.get("id");
  const ticketId = searchParams.get("ticket_id");
  
  // Step tracking
  const [currentStep, setCurrentStep] = useState(1); // 1: Template Selection, 2: Form Filling
  
  // Loading states
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isClientLoading, setIsClientLoading] = useState(true);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(true);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [isCreatingDocument, setIsCreatingDocument] = useState(false);
  const [isSendingForSigning, setIsSendingForSigning] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAddingToAllops, setIsAddingToAllops] = useState(false);
  
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
  const { templates: juroTemplates, status: juroStatus } = useAppSelector((state) => state.juro);
  const { clientById: detailedClientData, status: haloStatus } = useAppSelector((state) => state.halo);

  const loadTemplateDetails = useCallback((templateId: string) => {
    // Check if template is already cached
    if (templateCache[templateId]) {
      console.log(`Using cached template: ${templateId}`);
      processTemplateDetails(templateCache[templateId]);
      return;
    }

    setIsLoadingTemplate(true);
    dispatch(fetchJuroTemplate(templateId))
      .unwrap()
      .then((template) => {
        // Cache the template
        setTemplateCache(prev => ({
          ...prev,
          [templateId]: template
        }));
        processTemplateDetails(template);
        setIsLoadingTemplate(false);
      })
      .catch((error) => {
        console.error(`Error loading template ${templateId}:`, error);
        toast.error("Failed to load template details.");
        setIsLoadingTemplate(false);
      });
  }, [templateCache, dispatch]);

  const processTemplateDetails = useCallback((template: any) => {
    console.log("Processing template:", template.name);

    // Set template fields
    setTemplateFields(template.fields || []);
    setTemplateQuestions(template.questions || []);

    // Create initial document fields based on template fields and client data
    const initialFields: Record<string, string> = {};

    // Add special fields required by Juro
    initialFields.signatory_name = "Shane Thorne";
    initialFields.signatory_email = "s.thorne@cst.co.uk";

    // Handle counterparty_legal_name if it exists in template questions
    if (detailedClientData && template.questions && Array.isArray(template.questions)) {
      const counterpartyLegalNameQuestion = template.questions.find(
        (q: TemplateQuestion) => q.uid === "counterparty_legal_name"
      );

      if (counterpartyLegalNameQuestion) {
        initialFields.counterparty_legal_name = detailedClientData.name;
      }
    }

    // Map client data to template fields
    if (detailedClientData && template.fields) {
      // Map known field UIDs
      template.fields.forEach((field: TemplateField) => {
        switch (field.uid) {
          // Term field
          case "6128253a-93dc-4d83-b972-bb9497513843":
            initialFields[field.uid] = field.value || "12-Month";
            break;

          // Counterparty Contact Name
          case "73aa33aa-7469-41a4-9fff-76bb84a88fdd":
            initialFields[field.uid] =
              detailedClientData.accountsfirstname && detailedClientData.accountslastname
                ? `${detailedClientData.accountsfirstname} ${detailedClientData.accountslastname}`
                : detailedClientData.main_contact_name || "";
            break;

          // Counterparty Address
          case "2b82a989-7eee-4783-a544-2acec331cc84":
            if (detailedClientData.main_invoice_address) {
              const address = detailedClientData.main_invoice_address;
              initialFields[field.uid] = [
                address.line1,
                address.line2,
                address.line3,
                address.line4,
                address.postcode,
              ]
                .filter(Boolean)
                .join(", ");
            } else {
              initialFields[field.uid] = detailedClientData.address || "";
            }
            break;

          // Counterparty Contact Email
          case "2fff3269-19c6-4d02-9c78-d04156991bfb":
            initialFields[field.uid] =
              detailedClientData.accountsemailaddress ||
              detailedClientData.email ||
              "";
            break;

          // Contract Reason
          case "8de7e9ec-14dd-43cd-9367-7049c5f72a70":
            initialFields[field.uid] = ""; // Leave empty or set default
            break;

          // Effective Date
          case "6e338014-47de-42c7-a816-88935e1b9d0c":
            initialFields[field.uid] = new Date().toISOString().split("T")[0];
            break;

          // Quote Number
          case "9cea8342-725c-42c7-b50f-4ceb3425230a":
            initialFields[field.uid] = ticketId || "";
            break;

          // Delivery Date
          case "4a46d105-0072-4a3f-9aa5-8bf7daa56cc6":
            initialFields[field.uid] = new Date().toISOString().split("T")[0];
            break;

          // Expiration Date
          case "af79c1b8-d4af-4bd3-80aa-c7103058a965":
            const expirationDate = new Date();
            expirationDate.setMonth(expirationDate.getMonth() + 1);
            initialFields[field.uid] = expirationDate
              .toISOString()
              .split("T")[0];
            break;

          // Title (CST)
          case "afd7cc85-834f-4fd0-8e93-37d32f6f9afd":
            initialFields[field.uid] = "Account Director";
            break;

          // Title (Counterparty)
          case "df3b7695-0a0c-4081-9e7a-b902c87ede17":
            initialFields[field.uid] = detailedClientData.accountstitle || "";
            break;

          // Counterparty (Company)
          case "a50f21ec-0dd8-47dc-950b-15032103c63b":
            initialFields[field.uid] = detailedClientData.name || "";
            break;

          default:
            // For any other template fields, use default values if available
            if (field.value) {
              initialFields[field.uid] = field.value;
            }

            // Try to map fields based on titles
            const fieldTitle = field.title?.toLowerCase() || "";
            if (fieldTitle.includes("counterparty") || fieldTitle.includes("client")) {
              if (fieldTitle.includes("name") || fieldTitle.includes("company")) {
                initialFields[field.uid] = detailedClientData.name || "";
              } else if (fieldTitle.includes("address")) {
                if (detailedClientData.main_invoice_address) {
                  const address = detailedClientData.main_invoice_address;
                  initialFields[field.uid] = [
                    address.line1,
                    address.line2,
                    address.line3,
                    address.line4,
                    address.postcode,
                  ]
                    .filter(Boolean)
                    .join(", ");
                } else {
                  initialFields[field.uid] = detailedClientData.address || "";
                }
              } else if (
                fieldTitle.includes("email") ||
                fieldTitle.includes("contact")
              ) {
                initialFields[field.uid] =
                  detailedClientData.accountsemailaddress ||
                  detailedClientData.email ||
                  "";
              }
            }
        }
      });
    }

    // Add quote number as a default
    if (ticketId) {
      template.fields.forEach((field: TemplateField) => {
        if (field.title.toLowerCase().includes('quote') || 
            field.uid === '9cea8342-725c-42c7-b50f-4ceb3425230a') {
          initialFields[field.uid] = ticketId;
        }
      });
    }

    setDocumentFields(initialFields);
  }, [detailedClientData, ticketId]);

  const validateFields = () => {
    const errors: string[] = [];
    const fieldErrorsMap: Record<string, string> = {};
    
    // Check required fields
    templateQuestions
      .filter(q => q.isRequired)
      .forEach(question => {
        if (question.fieldUid) {
          if (!documentFields[question.fieldUid] || documentFields[question.fieldUid].trim() === "") {
            errors.push(`${question.title} is required`);
            fieldErrorsMap[question.fieldUid] = `${question.title} is required`;
          }
        }
      });
    
    // Validate document title
    if (!documentTitle || documentTitle.trim() === "") {
      errors.push("Document title is required");
      fieldErrorsMap["document-title"] = "Document title is required";
    }
    
    setValidationErrors(errors);
    setFieldErrors(fieldErrorsMap);
    return errors.length === 0;
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setDocumentFields(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear validation error for this field if it exists
    if (fieldErrors[fieldId]) {
      const updatedErrors = { ...fieldErrors };
      delete updatedErrors[fieldId];
      setFieldErrors(updatedErrors);
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

  // Load client data
  useEffect(() => {
    if (clientId) {
      // Check if the clientId is a valid number before parsing
      const parsedId = clientId.replace(/[{}$]/g, ''); // Remove any template placeholders like {$id}
      
      // Check if it's a valid numeric ID
      if (/^\d+$/.test(parsedId)) {
        setIsClientLoading(true);
        dispatch(fetchHaloClientById(parseInt(parsedId)))
          .unwrap()
          .then(() => {
            setIsClientLoading(false);
          })
          .catch((error) => {
            toast.error(`Error loading client data: ${error.message || 'Unknown error'}`);
            setIsClientLoading(false);
          });
      } else {
        // Handle case where ID is not a valid number
        toast.warning('Please provide a valid client ID in the URL');
        setIsClientLoading(false);
      }
    } else {
      setIsClientLoading(false);
    }
  }, [clientId, dispatch]);

  // Load templates
  useEffect(() => {
    setIsTemplatesLoading(true);
    dispatch(fetchJuroTemplates())
      .unwrap()
      .then(() => {
        setIsTemplatesLoading(false);
      })
      .catch((error) => {
        toast.error(`Error loading templates: ${error.message || 'Unknown error'}`);
        setIsTemplatesLoading(false);
      });
  }, [dispatch]);

  // Overall page loading state
  useEffect(() => {
    if (!isClientLoading && !isTemplatesLoading) {
      setIsPageLoading(false);
    }
  }, [isClientLoading, isTemplatesLoading]);

  // Load template details when selected
  useEffect(() => {
    if (selectedTemplate && detailedClientData) {
      loadTemplateDetails(selectedTemplate);
    }
  }, [selectedTemplate, detailedClientData, loadTemplateDetails]);

  // Set quote number from ticket ID
  useEffect(() => {
    if (ticketId && documentFields && templateFields.length > 0) {
      // Clean up ticket ID if it contains template placeholders
      const cleanTicketId = ticketId.replace(/[{}$]/g, '');
      
      // Look for the Quote Number field and set it from the ticket ID
      const quoteFields = templateFields.filter((field: TemplateField) => {
        return field.title.toLowerCase().includes('quote') || 
               field.uid === '9cea8342-725c-42c7-b50f-4ceb3425230a';
      });
      
      if (quoteFields.length > 0) {
        const newFields = { ...documentFields };
        quoteFields.forEach((field: TemplateField) => {
          newFields[field.uid] = cleanTicketId || '';
        });
        setDocumentFields(newFields);
      }
    }
  }, [ticketId, templateFields, documentFields]);

  // Set initial document title based on client name and template
  useEffect(() => {
    if (detailedClientData && selectedTemplate) {
      const template = juroTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        setDocumentTitle(`${detailedClientData.name} - ${template.name}`);
      }
    }
  }, [detailedClientData, selectedTemplate, juroTemplates]);

  const handleCreateDocument = async () => {
    if (!validateFields()) {
      return;
    }

    setIsCreatingDocument(true);

    try {
      // Use the helper to create a contract with proper signing side handling
      const requestData = JuroContractCreator.createContractPayload(
        selectedTemplate,
        documentTitle,
        documentFields,
        templateFields,
        templateQuestions,
        detailedClientData
      );

      const contract = await dispatch(createJuroContract(requestData)).unwrap();
      
      if (contract && contract.id) {
        setCreatedDocumentId(contract.id.toString());
        setDocumentCreated(true);
        
        // Generate document URL
        const documentUrl = `https://app.juro.com/sign/${contract.id}`;
        setDocumentUrl(documentUrl);
        
        setShowSuccessDialog(true);
        toast.success("Document created successfully!");
      } else {
        toast.error("Failed to create document: No ID returned");
      }
    } catch (error: any) {
      console.error("Error creating document:", error);
      
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.detail || 
                            error.response.data.message || 
                            "Unknown error";
        toast.error(`Failed to create document: ${errorMessage}`);
      } else {
        toast.error(`Failed to create document: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsCreatingDocument(false);
    }
  };

  const handleSendForSigning = async () => {
    if (!createdDocumentId) {
      toast.error("Please create the document first");
      return;
    }

    setIsSendingForSigning(true);

    try {
      // Use the helper to create a signing request
      const signingData = JuroContractCreator.createSigningRequest(
        documentFields,
        templateFields,
        detailedClientData,
        detailedClientData,
        selectedSignatureProvider
      );

      // Check that we have an email and name
      if (!signingData.recipients[0].email) {
        toast.error(
          "No client email address found. Please provide an email address for signing."
        );
        return;
      }

      if (!signingData.recipients[0].name) {
        toast.error(
          "No client name found. Please provide a name for the signatory."
        );
        return;
      }

      const signingResult = await dispatch(
        sendContractForSigning({
          contractId: createdDocumentId,
          signingUid: "primary",
          data: signingData,
        })
      ).unwrap();

      if (signingResult) {
        toast.success(
          `Document "${documentTitle}" sent for signing to ${signingData.recipients[0].email}`
        );
      }
    } catch (error: any) {
      console.error("Error sending document for signing:", error);
      
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.detail || 
                            error.response.data.message || 
                            "Unknown error";
        toast.error(`Failed to send for signing: ${errorMessage}`);
      } else {
        toast.error(`Failed to send for signing: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsSendingForSigning(false);
    }
  };

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

  const handleAddToAllops = async () => {
    if (!createdDocumentId || !documentTitle || !detailedClientData) {
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

  return (
    <div className="container max-w-5xl py-10">
      <ToastContainer position="top-right" autoClose={5000} />
      
      {/* Back button */}
      <div className="mb-6">
        <Link href="/juro" className="flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Juro Dashboard
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Create Document</h1>
      
      {/* Loading indicator for the whole page */}
      {isPageLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="flex items-center space-x-2 mb-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg">Loading...</span>
          </div>
          <p className="text-muted-foreground text-center">
            {isClientLoading && "Loading client data..."}
            {isTemplatesLoading && "Loading templates..."}
          </p>
        </div>
      ) : (
        <>
          {/* Client Information Banner */}
          {detailedClientData && (
            <Alert className="mb-6">
              <AlertTitle className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Creating document for: {detailedClientData.name}
              </AlertTitle>
              <AlertDescription>
                {ticketId && <span className="block">Quote/Ticket ID: {ticketId}</span>}
                {detailedClientData.email && <span className="block">Email: {detailedClientData.email}</span>}
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
                            <div className="h-4 bg-gray-100 rounded w-64"></div>
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
                        onClick={() => setSelectedTemplate(template.id)}
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
          
          {/* Step 2: Document Form */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Fill Document Details</CardTitle>
                <CardDescription>
                  Fill in the required information for your document
                </CardDescription>
              </CardHeader>
              <CardContent>
                {validationErrors.length > 0 && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Validation Errors</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-5 mt-2">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                {isLoadingTemplate ? (
                  <div className="space-y-6 animate-pulse">
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-32"></div>
                      <div className="h-10 bg-gray-100 rounded w-full"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-40"></div>
                      <div className="h-20 bg-gray-100 rounded w-full"></div>
                    </div>
                    <div className="border-t pt-6">
                      <div className="h-6 bg-gray-200 rounded w-36 mb-4"></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="space-y-2">
                            <div className="h-5 bg-gray-200 rounded w-32"></div>
                            <div className="h-10 bg-gray-100 rounded w-full"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="border rounded-md p-4">
                      <h3 className="text-sm font-medium mb-3">
                        Document Information
                      </h3>
                      <div className="grid grid-cols-4 items-center gap-4 mb-2">
                        <Label 
                          htmlFor="document-title" 
                          className={`text-right ${fieldErrors["document-title"] ? "text-destructive" : ""}`}
                        >
                          Document Title
                          {fieldErrors["document-title"] ? (
                            <span className="text-destructive">*</span>
                          ) : (
                            <span className="text-red-500">*</span>
                          )}
                        </Label>
                        <Input
                          id="document-title"
                          placeholder="Enter document title"
                          value={documentTitle}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          className={`col-span-3 ${fieldErrors["document-title"] ? "border-destructive" : ""}`}
                        />
                      </div>
                      {fieldErrors["document-title"] && (
                        <div className="grid grid-cols-4 gap-4">
                          <div></div>
                          <p className="text-xs text-destructive col-span-3">
                            {fieldErrors["document-title"]}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-4 items-center gap-4 mt-3">
                        <Label htmlFor="document-description" className="text-right">
                          Description
                        </Label>
                        <Textarea
                          id="document-description"
                          placeholder="Enter document description"
                          value={documentDescription}
                          onChange={(e) => setDocumentDescription(e.target.value)}
                          className="col-span-3"
                          rows={2}
                        />
                      </div>
                    </div>
                    
                    {/* Display special questions that don't have field mappings */}
                    {templateQuestions.filter(
                      (q) =>
                        !q.fieldUid &&
                        !["signatory_name", "signatory_email"].includes(q.uid)
                    ).length > 0 && (
                      <div className="border rounded-md p-4">
                        <h3 className="text-sm font-medium mb-3">
                          Document Questions
                        </h3>
                        {templateQuestions
                          .filter(
                            (q) =>
                              !q.fieldUid &&
                              !["signatory_name", "signatory_email"].includes(
                                q.uid
                              )
                          )
                          .map((question) => (
                            <div
                              key={question.uid}
                              className="grid grid-cols-4 items-start gap-4 mb-4"
                            >
                              <div className="text-right">
                                <Label
                                  htmlFor={question.uid}
                                  className={`capitalize ${fieldErrors[question.uid] ? "text-destructive" : ""}`}
                                >
                                  {question.title}
                                  {question.isRequired && (
                                    <span className={fieldErrors[question.uid] ? "text-destructive" : "text-red-500"}>*</span>
                                  )}
                                </Label>
                                {question.text && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {question.text}
                                  </p>
                                )}
                              </div>
                              <Input
                                id={question.uid}
                                value={documentFields[question.uid] || ""}
                                onChange={(e) =>
                                  handleFieldChange(question.uid, e.target.value)
                                }
                                className={`col-span-3 ${fieldErrors[question.uid] ? "border-destructive" : ""}`}
                                placeholder={`Enter ${question.title.toLowerCase()}`}
                              />
                              {fieldErrors[question.uid] && (
                                <div className="col-span-3 ml-auto">
                                  <p className="text-xs text-destructive">
                                    {fieldErrors[question.uid]}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Group fields by category */}
                    {Object.entries(groupFieldsByCategory()).map(
                      ([category, fields]) => (
                        <div
                          key={category}
                          className="border rounded-md p-4"
                        >
                          <h3 className="text-sm font-medium mb-3 capitalize">
                            {category} Information
                          </h3>
                          {fields.map((field) => {
                            const question = getQuestionForField(field.uid);
                            return (
                              <div
                                key={field.uid}
                                className="grid grid-cols-4 items-start gap-4 mb-4"
                              >
                                <div className="text-right">
                                  <Label
                                    htmlFor={field.uid}
                                    className={`capitalize ${fieldErrors[field.uid] ? "text-destructive" : ""}`}
                                  >
                                    {field.title}
                                    {question?.isRequired && (
                                      <span className={fieldErrors[field.uid] ? "text-destructive" : "text-red-500"}>*</span>
                                    )}
                                  </Label>
                                  {question?.text && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {question.text}
                                    </p>
                                  )}
                                </div>
                                
                                {field.type === "text_area" || field.type === "textArea" ? (
                                  <Textarea
                                    id={field.uid}
                                    value={documentFields[field.uid] || ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        field.uid,
                                        e.target.value
                                      )
                                    }
                                    className={`col-span-3 ${fieldErrors[field.uid] ? "border-destructive" : ""}`}
                                    rows={3}
                                    placeholder={
                                      field.value ||
                                      `Enter ${field.title.toLowerCase()}`
                                    }
                                  />
                                ) : field.type === "calendar" || field.type === "date" ? (
                                  <Input
                                    id={field.uid}
                                    type="date"
                                    value={documentFields[field.uid] || ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        field.uid,
                                        e.target.value
                                      )
                                    }
                                    className={`col-span-3 ${fieldErrors[field.uid] ? "border-destructive" : ""}`}
                                  />
                                ) : field.type === "companies-house" ? (
                                  <div className="col-span-3 flex flex-col gap-2">
                                    <Input
                                      id={field.uid}
                                      value={documentFields[field.uid] || ""}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          field.uid,
                                          e.target.value
                                        )
                                      }
                                      className={fieldErrors[field.uid] ? "border-destructive" : ""}
                                      placeholder={`Enter company name`}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      Company legally registered name
                                    </p>
                                  </div>
                                ) : (
                                  <Input
                                    id={field.uid}
                                    type={
                                      field.type === "email" ? "email" : "text"
                                    }
                                    value={documentFields[field.uid] || ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        field.uid,
                                        e.target.value
                                      )
                                    }
                                    className={`col-span-3 ${fieldErrors[field.uid] ? "border-destructive" : ""}`}
                                    placeholder={
                                      field.value ||
                                      `Enter ${field.title.toLowerCase()}`
                                    }
                                  />
                                )}
                                
                                {fieldErrors[field.uid] && (
                                  <div className="col-span-3 ml-auto">
                                    <p className="text-xs text-destructive">
                                      {fieldErrors[field.uid]}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )
                    )}
                    
                    <div className="border rounded-md p-4">
                      <h3 className="text-sm font-medium mb-3">
                        Signature Settings
                      </h3>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="signature-provider" className="text-right">
                          Signature Provider
                        </Label>
                        <Select 
                          value={selectedSignatureProvider}
                          onValueChange={setSelectedSignatureProvider}
                        >
                          <SelectTrigger id="signature-provider" className="col-span-3">
                            <SelectValue placeholder="Select signature provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="docusign">DocuSign</SelectItem>
                            <SelectItem value="adobe_sign">Adobe Sign</SelectItem>
                            <SelectItem value="pandadoc">PandaDoc</SelectItem>
                            <SelectItem value="hellosign">HelloSign</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back to Templates
                </Button>
                <Button 
                  onClick={handleCreateDocument} 
                  disabled={isCreatingDocument || isLoadingTemplate}
                >
                  {isCreatingDocument ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Document...
                    </>
                  ) : (
                    "Create Document"
                  )}
                </Button>
              </CardFooter>
            </Card>
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
