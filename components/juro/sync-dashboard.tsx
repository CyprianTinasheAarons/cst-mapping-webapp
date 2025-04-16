"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Lock,
  FileText,
  Plus,
  Download,
  Send,
  AlertCircle,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchHaloClients,
  fetchHaloContracts,
  fetchHaloClientById,
} from "../../slices/halo/haloSlice";
import {
  fetchJuroTemplates,
  fetchJuroTemplate,
  createJuroContract,
  sendContractForSigning,
} from "../../slices/juro/juroSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

export function SyncDashboard() {
  const [clientSearch, setClientSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  // Document states
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [documentFields, setDocumentFields] = useState<Record<string, string>>(
    {}
  );
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([]);
  const [templateQuestions, setTemplateQuestions] = useState<
    TemplateQuestion[]
  >([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedSignatureProvider, setSelectedSignatureProvider] =
    useState("docusign");
  const [customTemplate, setCustomTemplate] = useState("");
  const [documentStatus, setDocumentStatus] = useState<Record<string, string>>(
    {}
  );
  const [templateSelectionHistory, setTemplateSelectionHistory] = useState<
    string[]
  >([]);
  const [fieldChangeHistory, setFieldChangeHistory] = useState<
    Array<{ field: string; value: string }>
  >([]);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [isLoadingClientDetails, setIsLoadingClientDetails] = useState(false);
  const [isCreatingDocument, setIsCreatingDocument] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [createdDocumentId, setCreatedDocumentId] = useState<string | null>(
    null
  );
  const [documentCreated, setDocumentCreated] = useState(false);

  const dispatch = useAppDispatch();

  const {
    clients: haloClients,
    status: haloStatus,
    contracts: haloContracts,
    clientById: detailedClientData,
  } = useAppSelector((state) => state.halo);

  const {
    templates: juroTemplates,
    status: juroStatus,
    currentTemplate,
  } = useAppSelector((state) => state.juro);

  useEffect(() => {
    if (haloStatus === "idle") {
      dispatch(fetchHaloClients());
      dispatch(fetchHaloContracts());
      dispatch(fetchJuroTemplates());
    }
  }, [haloStatus, dispatch]);

  // Handle when template details are fetched
  useEffect(() => {
    if (currentTemplate && selectedTemplate && detailedClientData) {
      processTemplateDetails(currentTemplate);
      setIsLoadingTemplate(false);
    }
  }, [currentTemplate, detailedClientData]);

  // Handle when detailed client data is fetched
  useEffect(() => {
    if (detailedClientData && selectedTemplate && currentTemplate) {
      processTemplateDetails(currentTemplate);
      setIsLoadingClientDetails(false);
    }
  }, [detailedClientData, selectedTemplate, currentTemplate]);

  // Reset loading states if the status changes to success or failure
  useEffect(() => {
    if (haloStatus === "succeeded" || haloStatus === "failed") {
      setIsLoadingClientDetails(false);
    }
  }, [haloStatus]);

  useEffect(() => {
    if (juroStatus === "succeeded" || juroStatus === "failed") {
      setIsLoadingTemplate(false);
      setIsCreatingDocument(false);
    }
  }, [juroStatus]);

  const processTemplateDetails = (template: any) => {
    if (!template || !template.fields) return;

    // Set template fields
    setTemplateFields(template.fields || []);
    setTemplateQuestions(template.questions || []);

    // Create initial document fields based on template fields and client data
    const initialFields: Record<string, string> = {};

    // Add client data with more detailed information if available
    if (selectedClient) {
      const clientData = detailedClientData || selectedClient;

      // Basic client info
      initialFields.clientName = clientData.name || "";
      initialFields.clientId = clientData.id?.toString() || "";

      // Contact details
      initialFields.clientEmail =
        clientData.accountsemailaddress || clientData.email || "";
      initialFields.clientPhone =
        clientData.main_phonenumber || clientData.phone || "";

      // Address information from main_invoice_address if available
      if (clientData.main_invoice_address) {
        const address = clientData.main_invoice_address;
        initialFields.clientAddress = [
          address.line1,
          address.line2,
          address.line3,
          address.line4,
          address.postcode,
        ]
          .filter(Boolean)
          .join(", ");
      } else {
        initialFields.clientAddress = clientData.address || "";
      }

      // Additional contact person details
      initialFields.accountsFirstName = clientData.accountsfirstname || "";
      initialFields.accountsLastName = clientData.accountslastname || "";
      initialFields.accountsFullName =
        clientData.accountsfirstname && clientData.accountslastname
          ? `${clientData.accountsfirstname} ${clientData.accountslastname}`
          : "";

      // Business details
      initialFields.tradingName =
        clientData.trading_name || clientData.name || "";
      initialFields.accountsId = clientData.accountsid || "";
      initialFields.website = clientData.website || "";
      initialFields.domain = clientData.domain || "";
    }

    // Add company data
    initialFields.companyName = "CST LTD";
    initialFields.companyAddress = "CST LTD, Maidenhead, UK";
    initialFields.companyEmail = "info@cstltd.com";
    initialFields.companyPhone = "01628 531400";
    initialFields.date = new Date().toISOString().split("T")[0];
    initialFields.effectiveDate = new Date().toISOString().split("T")[0];

    // Add template-specific fields with default values if available
    template.fields.forEach((field: TemplateField) => {
      initialFields[field.uid] = field.value || "";
    });

    // Map known fields to more user-friendly names
    // Main counterparty name field
    const counterpartyField = template.fields.find(
      (f: TemplateField) => f.uid === "a50f21ec-0dd8-47dc-950b-15032103c63b"
    );
    if (counterpartyField) {
      initialFields[counterpartyField.uid] = selectedClient?.name || "";
    }

    // Map counterparty contact fields based on field titles
    if (selectedClient && template.fields) {
      const clientData = detailedClientData || selectedClient;

      // Iterate through template fields to find and map counterparty fields
      template.fields.forEach((field: TemplateField) => {
        const fieldTitle = field.title?.toLowerCase() || "";

        // Map Counterparty Contact Name
        if (
          fieldTitle.includes("counterparty contact name") ||
          fieldTitle.includes("counterparty contact")
        ) {
          initialFields[field.uid] =
            clientData.accountsfirstname && clientData.accountslastname
              ? `${clientData.accountsfirstname} ${clientData.accountslastname}`
              : clientData.main_contact_name || "";
        }

        // Map Counterparty Address
        if (fieldTitle.includes("counterparty address")) {
          if (clientData.main_invoice_address) {
            const address = clientData.main_invoice_address;
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
            initialFields[field.uid] = clientData.address || "";
          }
        }

        // Map Counterparty Email
        if (
          fieldTitle.includes("counterparty email") ||
          fieldTitle.includes("counterparty contact email")
        ) {
          initialFields[field.uid] =
            clientData.accountsemailaddress ||
            clientData.main_contact_email ||
            clientData.email ||
            "";
        }

        // Map Counterparty Phone
        if (
          fieldTitle.includes("counterparty phone") ||
          fieldTitle.includes("counterparty contact phone")
        ) {
          initialFields[field.uid] =
            clientData.main_phonenumber ||
            clientData.main_contact_phonenumber ||
            clientData.phone ||
            "";
        }
      });
    }

    // Set the document title based on template and client
    setDocumentTitle(`${template.name} - ${selectedClient?.name || ""}`);

    // Update document fields
    setDocumentFields(initialFields);
  };

  const filteredClients = haloClients
    .filter(
      (client) =>
        client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        client.id.toString().includes(clientSearch)
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const totalFilteredClients = filteredClients.length;

  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenDocument = (client: any) => {
    setSelectedClient(client);
    setDocumentTitle("");
    setDocumentDescription("");
    // Reset template and form fields
    setSelectedTemplate("");
    setCustomTemplate("");
    setDocumentFields({});
    setTemplateFields([]);
    setTemplateQuestions([]);
    setIsPreviewMode(false);
    setIsDocumentDialogOpen(true);
    // Reset history
    setTemplateSelectionHistory([]);
    setFieldChangeHistory([]);
    // Reset document creation state
    setDocumentCreated(false);
    setCreatedDocumentId(null);
    setValidationErrors([]);

    // Fetch complete client details
    setIsLoadingClientDetails(true);
    dispatch(fetchHaloClientById(client.id))
      .unwrap()
      .catch(() => {
        setIsLoadingClientDetails(false);
        toast.error("Failed to load client details");
      });
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setIsPreviewMode(false);
    setTemplateSelectionHistory([...templateSelectionHistory, templateId]);
    // Reset document creation state
    setDocumentCreated(false);
    setCreatedDocumentId(null);
    setValidationErrors([]);

    // Fetch template details if not a custom template
    if (templateId !== "custom") {
      setIsLoadingTemplate(true);
      dispatch(fetchJuroTemplate(templateId));
    } else {
      // Handle custom template
      const autoFields: Record<string, string> = {
        clientName: selectedClient?.name || "",
        clientId: selectedClient?.id?.toString() || "",
      };

      // Add client details if available
      if (detailedClientData) {
        autoFields.clientEmail = detailedClientData.accountsemailaddress || "";
        autoFields.clientPhone = detailedClientData.main_phonenumber || "";

        if (detailedClientData.main_invoice_address) {
          const address = detailedClientData.main_invoice_address;
          autoFields.clientAddress = [
            address.line1,
            address.line2,
            address.line3,
            address.line4,
            address.postcode,
          ]
            .filter(Boolean)
            .join(", ");
        }

        autoFields.accountsFullName =
          detailedClientData.accountsfirstname &&
          detailedClientData.accountslastname
            ? `${detailedClientData.accountsfirstname} ${detailedClientData.accountslastname}`
            : "";
        autoFields.tradingName =
          detailedClientData.trading_name || detailedClientData.name || "";
        autoFields.accountsId = detailedClientData.accountsid || "";
        autoFields.website = detailedClientData.website || "";
        autoFields.domain = detailedClientData.domain || "";
      }

      // Common fields
      autoFields.date = new Date().toISOString().split("T")[0];
      autoFields.companyName = "CST LTD";
      autoFields.companyAddress = "Maidenhead, UK";
      autoFields.companyEmail = "info@cstltd.com";
      autoFields.companyPhone = "01628 531400";
      autoFields.effectiveDate = new Date().toISOString().split("T")[0];

      setDocumentTitle(`Custom Agreement - ${selectedClient?.name || ""}`);
      setDocumentFields(autoFields);
      setTemplateFields([]);
      setTemplateQuestions([]);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setDocumentFields({
      ...documentFields,
      [key]: value,
    });
    setFieldChangeHistory([...fieldChangeHistory, { field: key, value }]);
  };

  const validateFields = () => {
    const errors: string[] = [];

    // Only validate document title
    if (!documentTitle.trim()) {
      errors.push("Document title is required");
    }

    // Validate required template fields, but skip any client-related ones
    templateQuestions.forEach((question) => {
      if (question.isRequired && !documentFields[question.fieldUid]?.trim()) {
        const fieldTitle =
          templateFields.find((f) => f.uid === question.fieldUid)?.title ||
          question.title;

        // Skip validation for any client-related fields
        const fieldTitleLower = fieldTitle.toLowerCase();
        const isClientField =
          fieldTitleLower.includes("client") ||
          fieldTitleLower.includes("counterparty") ||
          fieldTitleLower.includes("customer") ||
          fieldTitleLower.includes("contact") ||
          fieldTitleLower.includes("email") ||
          fieldTitleLower.includes("phone") ||
          fieldTitleLower.includes("address") ||
          fieldTitleLower.includes("name");

        if (!isClientField) {
          errors.push(`${fieldTitle} is required`);
        }
      }
    });

    // Show errors as toasts instead of in alert
    if (errors.length > 0) {
      errors.forEach((error) => {
        toast.error(error);
      });
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handlePreview = () => {
    if (!validateFields()) {
      return;
    }
    setIsPreviewMode(true);
  };

  const handleCreateDocument = () => {
    if (!validateFields()) {
      return;
    }

    setIsCreatingDocument(true);

    // Transform document fields from object to array format
    const fieldsArray = Object.entries(documentFields).map(([uid, value]) => ({
      uid,
      value: value?.toString() || "",
    }));

    // Create properly formatted request according to API specs
    const requestData = {
      templateId: selectedTemplate,
      contract: {
        answers: [], // If we have answers, we'd format them here
        fields: fieldsArray,
        owner: {
          name: "Shane Thorne",
          username: "s.thorne@cst.co.uk",
        },
        name: documentTitle,
      },
    };

    // Dispatch action to create contract with correctly formatted data
    dispatch(createJuroContract(requestData))
      .unwrap()
      .then((contract) => {
        if (contract && contract.id) {
          setCreatedDocumentId(contract.id.toString());
          setDocumentCreated(true);
          toast.success(`Document "${documentTitle}" created successfully`);
        }
      })
      .catch((error) => {
        console.error("Error creating document:", error);
        toast.error("Failed to create document. Please try again.");
      })
      .finally(() => {
        setIsCreatingDocument(false);
      });
  };

  const handleSendForSigning = () => {
    if (!createdDocumentId) {
      toast.error("Please create the document first");
      return;
    }

    try {
      const signingData = {
        provider: selectedSignatureProvider,
        recipients: [
          {
            email:
              documentFields.clientEmail ||
              selectedClient.email ||
              detailedClientData?.accountsemailaddress,
            name: documentFields.clientName || selectedClient.name,
            role: "Signatory",
          },
        ],
      };

      dispatch(
        sendContractForSigning({
          contractId: createdDocumentId,
          signingUid: "primary",
          data: signingData,
        })
      )
        .unwrap()
        .then((signingResult) => {
          if (signingResult) {
            // Update document status
            const documentId = signingResult.id || createdDocumentId;
            setDocumentStatus({
              ...documentStatus,
              [documentId]: "Sent for signature",
            });

            toast.success(`Document "${documentTitle}" sent for signing`);
            setIsDocumentDialogOpen(false);
          }
        })
        .catch((error) => {
          console.error("Error sending document for signing:", error);
          toast.error("Failed to send document. Please try again.");
        });
    } catch (error) {
      console.error("Error preparing document for signing:", error);
      toast.error("Failed to send document. Please try again.");
    }
  };

  const handleDownload = () => {
    if (!createdDocumentId) {
      toast.error("Please create the document first");
      return;
    }

    // Simulate download functionality
    toast.success(`Document "${documentTitle}" downloaded`);
    // In a real implementation, this would trigger a download of the document using the document ID
  };

  // Helper function to determine contract type from template
  const getContractTypeFromTemplate = (templateId: string): string => {
    const selectedTemplateObj = juroTemplates.find(
      (template) => template.id === templateId
    );
    if (selectedTemplateObj) {
      return selectedTemplateObj.name;
    }

    if (templateId === "custom") {
      return "Custom Agreement";
    }

    return "Contract";
  };

  const handleCustomTemplateChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setCustomTemplate(e.target.value);
    setFieldChangeHistory([
      ...fieldChangeHistory,
      { field: "customTemplate", value: e.target.value },
    ]);
  };

  const handleViewContracts = (client: any) => {
    setSelectedClient(client);
    setIsContractDialogOpen(true);
  };

  // Get contracts for the selected client
  const clientContracts = haloContracts.filter(
    (contract) => selectedClient && contract.client_id === selectedClient.id
  );

  // Helper function to find a question for a field
  const getQuestionForField = (fieldUid: string) => {
    return templateQuestions.find((q) => q.fieldUid === fieldUid);
  };

  // Helper function to determine if a field should be rendered
  const shouldRenderField = (field: TemplateField) => {
    // Skip internal fields or fields that don't need user input
    const skipFields = ["signatory_name", "signatory_email"];
    return !skipFields.includes(field.uid);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-[1200px] w-full mx-auto">
          <div className="w-full min-w-[1000px] mx-auto">
            <div className="w-full max-w-[900px] mx-auto">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Search clients"
                      className="max-w-2xl"
                      value={clientSearch}
                      onChange={(e) => {
                        setClientSearch(e.target.value);
                        setCurrentPage(1); // Reset to first page on new search
                      }}
                    />
                    <Button variant="outline" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">
                          {client.name}
                          <div className="text-sm text-muted-foreground">
                            ID: {client.id}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewContracts(client)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Contracts
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDocument(client)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Document
                            </Button>
                            <Button variant="outline" size="sm">
                              <Lock className="h-4 w-4 mr-2" />
                              Admin
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <PaginationComponent
                  currentPage={currentPage}
                  totalItems={totalFilteredClients}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Document Creation Dialog */}
      <Dialog
        open={isDocumentDialogOpen}
        onOpenChange={setIsDocumentDialogOpen}
      >
        <DialogContent
          className={cn(
            isPreviewMode ? "sm:max-w-[1000px]" : "sm:max-w-[750px]",
            "max-h-[90vh] overflow-y-auto"
          )}
        >
          <DialogHeader>
            <DialogTitle>
              {isPreviewMode ? "Document Preview" : "Create Document"}
            </DialogTitle>
            <DialogDescription>
              {isPreviewMode
                ? "Preview your document before sending"
                : `Create a new document for ${selectedClient?.name}`}
            </DialogDescription>
          </DialogHeader>

          {isLoadingClientDetails ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3">Loading client details...</span>
            </div>
          ) : !selectedTemplate && !isPreviewMode ? (
            <div className="space-y-4 py-4">
              <Label className="text-base">Select a document template</Label>
              <div className="grid grid-cols-1 gap-3">
                {juroTemplates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    className="justify-start h-auto py-3 px-4"
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <FileText className="h-4 w-4 mr-3" />
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>
          ) : isLoadingTemplate ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3">Loading template...</span>
            </div>
          ) : isPreviewMode ? (
            <div className="py-4 space-y-4">
              {!documentCreated && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Document not created yet</AlertTitle>
                  <AlertDescription>
                    Please create the document to enable downloading and signing
                  </AlertDescription>
                </Alert>
              )}

              {documentCreated && (
                <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                  <AlertTitle>Document Created Successfully</AlertTitle>
                  <AlertDescription>
                    Document ID: {createdDocumentId}
                  </AlertDescription>
                </Alert>
              )}

              <div className="border rounded-md p-6 bg-white text-black min-h-[400px] max-h-[600px] overflow-y-auto">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold">{documentTitle}</h1>
                  <p className="text-gray-500">{documentDescription}</p>
                </div>

                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-bold mb-2">From:</h3>
                      <p>{documentFields.companyName || "CST LTD"}</p>
                      <p>{documentFields.companyAddress || "Maidenhead, UK"}</p>
                      <p>{documentFields.companyEmail || "info@cstltd.com"}</p>
                      <p>{documentFields.companyPhone || "01628 531400"}</p>
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">To:</h3>
                      <p>{documentFields.clientName}</p>
                      <p>{documentFields.clientAddress}</p>
                      <p>{documentFields.clientEmail}</p>
                      <p>{documentFields.clientPhone}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-bold mb-2">Document Details:</h3>
                  <div className="space-y-2">
                    <p>
                      <strong>Date:</strong> {documentFields.date}
                    </p>
                    {templateFields.map((field) => {
                      const value = documentFields[field.uid] || "";
                      if (value) {
                        return (
                          <p key={field.uid}>
                            <strong>{field.title}:</strong> {value}
                          </p>
                        );
                      }
                      return null;
                    })}

                    {selectedTemplate === "custom" && (
                      <div className="whitespace-pre-wrap mt-4 border-t pt-4">
                        <h4 className="font-bold mb-2">Custom Content:</h4>
                        {customTemplate}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-8 border-t mt-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="font-bold mb-10">
                        Signature: ________________
                      </p>
                      <p>{documentFields.companyName || "CST LTD"}</p>
                      <p>Name: ________________</p>
                      <p>
                        Title:{" "}
                        {documentFields[
                          "afd7cc85-834f-4fd0-8e93-37d32f6f9afd"
                        ] || "Account Director"}
                      </p>
                      <p>Date: ________________</p>
                    </div>
                    <div>
                      <p className="font-bold mb-10">
                        Signature: ________________
                      </p>
                      <p>{documentFields.clientName}</p>
                      <p>
                        Name:{" "}
                        {documentFields.accountsFullName || "________________"}
                      </p>
                      <p>
                        Title:{" "}
                        {documentFields[
                          "df3b7695-0a0c-4081-9e7a-b902c87ede17"
                        ] || ""}
                      </p>
                      <p>Date: ________________</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              {/* Validation errors are shown as toast notifications */}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  className="col-span-3"
                  rows={2}
                />
              </div>

              {templateFields.length > 0 && (
                <div className="border rounded-md p-4 mt-2">
                  <h3 className="text-sm font-medium mb-3">Template Fields</h3>
                  {templateFields.filter(shouldRenderField).map((field) => {
                    const question = getQuestionForField(field.uid);
                    return (
                      <div
                        key={field.uid}
                        className="grid grid-cols-4 items-start gap-4 mb-4"
                      >
                        <div className="text-right">
                          <Label htmlFor={field.uid} className="capitalize">
                            {field.title}
                            {question?.isRequired && (
                              <span className="text-red-500">*</span>
                            )}
                          </Label>
                          {question?.text && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {question.text}
                            </p>
                          )}
                        </div>
                        {field.type === "text_area" ? (
                          <Textarea
                            id={field.uid}
                            value={documentFields[field.uid] || ""}
                            onChange={(e) =>
                              handleFieldChange(field.uid, e.target.value)
                            }
                            className="col-span-3"
                            rows={3}
                            placeholder={`Enter ${field.title.toLowerCase()}`}
                          />
                        ) : field.type === "calendar" ? (
                          <Input
                            id={field.uid}
                            type="date"
                            value={documentFields[field.uid] || ""}
                            onChange={(e) =>
                              handleFieldChange(field.uid, e.target.value)
                            }
                            className="col-span-3"
                          />
                        ) : (
                          <Input
                            id={field.uid}
                            type={field.type === "email" ? "email" : "text"}
                            value={documentFields[field.uid] || ""}
                            onChange={(e) =>
                              handleFieldChange(field.uid, e.target.value)
                            }
                            className="col-span-3"
                            placeholder={`Enter ${field.title.toLowerCase()}`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="border rounded-md p-4 mt-2">
                <h3 className="text-sm font-medium mb-3">Client Information</h3>
                <div className="grid grid-cols-4 items-center gap-4 mb-2">
                  <Label htmlFor="clientName" className="text-right">
                    Client Name<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="clientName"
                    value={documentFields.clientName || ""}
                    onChange={(e) =>
                      handleFieldChange("clientName", e.target.value)
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4 mb-2">
                  <Label htmlFor="clientEmail" className="text-right">
                    Client Email<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={documentFields.clientEmail || ""}
                    onChange={(e) =>
                      handleFieldChange("clientEmail", e.target.value)
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4 mb-2">
                  <Label htmlFor="clientAddress" className="text-right">
                    Client Address
                  </Label>
                  <Input
                    id="clientAddress"
                    value={documentFields.clientAddress || ""}
                    onChange={(e) =>
                      handleFieldChange("clientAddress", e.target.value)
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4 mb-2">
                  <Label htmlFor="clientPhone" className="text-right">
                    Client Phone
                  </Label>
                  <Input
                    id="clientPhone"
                    value={documentFields.clientPhone || ""}
                    onChange={(e) =>
                      handleFieldChange("clientPhone", e.target.value)
                    }
                    className="col-span-3"
                  />
                </div>
                {detailedClientData?.accountsfirstname && (
                  <div className="grid grid-cols-4 items-center gap-4 mb-2">
                    <Label htmlFor="accountsContact" className="text-right">
                      Accounts Contact
                    </Label>
                    <Input
                      id="accountsContact"
                      value={documentFields.accountsFullName || ""}
                      onChange={(e) =>
                        handleFieldChange("accountsFullName", e.target.value)
                      }
                      className="col-span-3"
                    />
                  </div>
                )}
                {detailedClientData?.accountsid && (
                  <div className="grid grid-cols-4 items-center gap-4 mb-2">
                    <Label htmlFor="accountsId" className="text-right">
                      Accounts ID
                    </Label>
                    <Input
                      id="accountsId"
                      value={documentFields.accountsId || ""}
                      onChange={(e) =>
                        handleFieldChange("accountsId", e.target.value)
                      }
                      className="col-span-3"
                    />
                  </div>
                )}
                {detailedClientData?.website && (
                  <div className="grid grid-cols-4 items-center gap-4 mb-2">
                    <Label htmlFor="website" className="text-right">
                      Website
                    </Label>
                    <Input
                      id="website"
                      value={documentFields.website || ""}
                      onChange={(e) =>
                        handleFieldChange("website", e.target.value)
                      }
                      className="col-span-3"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {isPreviewMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewMode(false)}
                  className="mr-auto"
                >
                  Back to Edit
                </Button>

                {!documentCreated ? (
                  <Button
                    onClick={handleCreateDocument}
                    disabled={isCreatingDocument}
                  >
                    {isCreatingDocument ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full" />
                        Creating...
                      </>
                    ) : (
                      <>Create Document</>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleDownload}
                      variant="secondary"
                      disabled={!documentCreated}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={handleSendForSigning}
                      disabled={!documentCreated}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send for Signing
                    </Button>
                  </>
                )}
              </>
            ) : selectedTemplate ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTemplate("")}
                  className="mr-auto"
                >
                  Back to Templates
                </Button>
                <Button
                  onClick={handlePreview}
                  variant="secondary"
                  className="mr-2"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  onClick={handleCreateDocument}
                  disabled={isCreatingDocument}
                >
                  {isCreatingDocument ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full" />
                      Creating...
                    </>
                  ) : (
                    <>Create Document</>
                  )}
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsDocumentDialogOpen(false)}
              >
                Cancel
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isContractDialogOpen}
        onOpenChange={setIsContractDialogOpen}
      >
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Contracts for {selectedClient?.name}</DialogTitle>
            <DialogDescription>
              View and manage all contracts for this client
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-between items-center mb-4">
            <Input placeholder="Search contracts..." className="max-w-sm" />
            <Button onClick={() => handleOpenDocument(selectedClient)}>
              <Plus className="h-4 w-4 mr-2" />
              New Document
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientContracts.length > 0 ? (
                clientContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">
                      {contract.ref}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          contract.status === "Active" ? "default" : "outline"
                        }
                      >
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(contract.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Badge
                          variant={
                            documentStatus[contract.id]
                              ? "outline"
                              : "secondary"
                          }
                          className="ml-2"
                        >
                          {documentStatus[contract.id] || contract.status}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      No contracts found for this client.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => handleOpenDocument(selectedClient)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Document
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
      <ToastContainer />
    </div>
  );
}

interface PaginationComponentProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

function PaginationComponent({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationComponentProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginationItems = [];

  // Add first three pages
  for (let i = 0; i < Math.min(3, totalPages); i++) {
    paginationItems.push(i + 1);
  }

  // Add ellipsis if needed
  if (totalPages > 5 && currentPage > 4) {
    paginationItems.push("...");
  }

  // Add current page and surrounding pages
  if (currentPage > 3 && currentPage < totalPages - 2) {
    paginationItems.push(currentPage);
  }

  // Add last two pages
  for (let i = Math.max(totalPages - 2, 4); i <= totalPages; i++) {
    if (!paginationItems.includes(i)) {
      paginationItems.push(i);
    }
  }

  return (
    <Pagination>
      <PaginationContent style={{ justifyContent: "center" }}>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          />
        </PaginationItem>
        {paginationItems.map((item, index) => (
          <PaginationItem key={index}>
            {item === "..." ? (
              <span>...</span>
            ) : (
              <PaginationLink
                isActive={currentPage === item}
                onClick={() =>
                  onPageChange(typeof item === "number" ? item : currentPage)
                }
              >
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
