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
  FolderPlus,
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
} from "../../slices/halo/haloSlice";
import {
  fetchJuroTemplates,
  fetchJuroTemplate,
  createJuroContract,
  sendContractForSigning,
  addContractToHalo,
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

  const dispatch = useAppDispatch();

  const {
    clients: haloClients,
    status: haloStatus,
    contracts: haloContracts,
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
    if (currentTemplate && selectedTemplate) {
      processTemplateDetails(currentTemplate);
      setIsLoadingTemplate(false);
    }
  }, [currentTemplate]);

  const processTemplateDetails = (template: any) => {
    if (!template || !template.fields) return;

    // Set template fields
    setTemplateFields(template.fields || []);
    setTemplateQuestions(template.questions || []);

    // Create initial document fields based on template fields and client data
    const initialFields: Record<string, string> = {};

    // Add client data
    if (selectedClient) {
      initialFields.clientName = selectedClient.name;
      initialFields.clientId = selectedClient.id.toString();
      initialFields.clientEmail = selectedClient.email || "";
      initialFields.clientAddress = selectedClient.address || "";
      initialFields.clientPhone = selectedClient.phone || "";
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
    const counterpartyField = template.fields.find(
      (f: TemplateField) => f.uid === "a50f21ec-0dd8-47dc-950b-15032103c63b"
    );
    if (counterpartyField) {
      initialFields[counterpartyField.uid] = selectedClient?.name || "";
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

  // E-signature providers
  const signatureProviders = [
    { id: "docusign", name: "DocuSign" },
    { id: "adobesign", name: "Adobe Sign" },
    { id: "pandadoc", name: "PandaDoc" },
    { id: "hellosign", name: "HelloSign" },
  ];

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
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setIsPreviewMode(false);
    setTemplateSelectionHistory([...templateSelectionHistory, templateId]);

    // Fetch template details if not a custom template
    if (templateId !== "custom") {
      setIsLoadingTemplate(true);
      dispatch(fetchJuroTemplate(templateId));
    } else {
      // Handle custom template
      const autoFields: Record<string, string> = {
        clientName: selectedClient?.name || "",
        clientId: selectedClient?.id?.toString() || "",
        clientEmail: selectedClient?.email || "",
        clientAddress: selectedClient?.address || "",
        clientPhone: selectedClient?.phone || "",
        clientWebsite: selectedClient?.website || "",
        clientType: selectedClient?.type || "Business",
        contactPerson: selectedClient?.contactPerson || "",
        contactEmail: selectedClient?.contactEmail || "",
        contactPhone: selectedClient?.contactPhone || "",
        date: new Date().toISOString().split("T")[0],
        companyName: "CST LTD",
        companyAddress: "Maidenhead, UK",
        companyEmail: "info@cstltd.com",
        companyPhone: "01628 531400",
        effectiveDate: new Date().toISOString().split("T")[0],
      };

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

  const handlePreview = () => {
    if (!documentTitle.trim()) {
      toast.error("Document title is required");
      return;
    }
    setIsPreviewMode(true);
  };

  const handleSendForSigning = () => {
    if (!documentTitle.trim()) {
      toast.error("Document title is required");
      return;
    }

    try {
      // Prepare contract data
      const contractData = {
        title: documentTitle,
        description: documentDescription,
        templateId: selectedTemplate,
        fields: documentFields,
        client: selectedClient,
        signatureProvider: selectedSignatureProvider,
        history: {
          templateSelections: templateSelectionHistory,
          fieldChanges: fieldChangeHistory,
        },
      };

      // Dispatch action to send contract for signing
      dispatch(createJuroContract(contractData))
        .unwrap()
        .then((contract) => {
          if (contract && contract.id) {
            // Once contract is created, send it for signing
            const signingData = {
              provider: selectedSignatureProvider,
              recipients: [
                {
                  email: documentFields.clientEmail || selectedClient.email,
                  name: documentFields.clientName || selectedClient.name,
                  role: "Signatory",
                },
              ],
            };

            return dispatch(
              sendContractForSigning({
                contractId: contract.id.toString(),
                signingUid: "primary",
                data: signingData,
              })
            ).unwrap();
          }
          return null;
        })
        .then((signingResult) => {
          if (signingResult) {
            // Update document status
            const documentId = signingResult.id || `doc-${Date.now()}`;
            setDocumentStatus({
              ...documentStatus,
              [documentId]: "Sent for signature",
            });

            toast.success(
              `Document "${documentTitle}" sent for signing via ${
                signatureProviders.find(
                  (p) => p.id === selectedSignatureProvider
                )?.name
              }`
            );
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

  const handleAddToHalo = () => {
    if (!documentTitle.trim()) {
      toast.error("Document title is required");
      return;
    }

    try {
      // Prepare contract data
      const contractData = {
        title: documentTitle,
        description: documentDescription,
        type: getContractTypeFromTemplate(selectedTemplate),
        templateId: selectedTemplate,
        fields: documentFields,
        startDate:
          documentFields.startDate ||
          documentFields.effectiveDate ||
          new Date().toISOString(),
        endDate: documentFields.endDate || "",
        history: {
          templateSelections: templateSelectionHistory,
          fieldChanges: fieldChangeHistory,
        },
      };

      // Dispatch action to add contract to Halo
      dispatch(
        addContractToHalo({
          clientId: selectedClient.id,
          contractData,
        })
      )
        .unwrap()
        .then((result) => {
          if (result) {
            // Update document status
            const documentId = result.juro.id || `doc-${Date.now()}`;
            setDocumentStatus({
              ...documentStatus,
              [documentId]: "Added to Halo",
            });

            toast.success(`Document "${documentTitle}" added to Halo`);
            setIsDocumentDialogOpen(false);
          }
        })
        .catch((error) => {
          console.error("Error adding document to Halo:", error);
          toast.error("Failed to add document to Halo. Please try again.");
        });
    } catch (error) {
      console.error("Error preparing document for Halo:", error);
      toast.error("Failed to add document to Halo. Please try again.");
    }
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

          {!selectedTemplate && !isPreviewMode ? (
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
                <Button
                  key="custom"
                  variant="outline"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => handleTemplateSelect("custom")}
                >
                  <FileText className="h-4 w-4 mr-3" />
                  Custom Template
                </Button>
              </div>
            </div>
          ) : isLoadingTemplate ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3">Loading template...</span>
            </div>
          ) : isPreviewMode ? (
            <div className="py-4 space-y-4">
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
                      <p>Name: ________________</p>
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

              <div className="flex flex-col space-y-2">
                <Label htmlFor="signature-provider">Signature Provider</Label>
                <Select
                  value={selectedSignatureProvider}
                  onValueChange={setSelectedSignatureProvider}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a signature provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {signatureProviders.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
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

              {selectedTemplate === "custom" && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="custom-template" className="text-right">
                    Custom Template
                  </Label>
                  <Textarea
                    id="custom-template"
                    value={customTemplate}
                    onChange={handleCustomTemplateChange}
                    className="col-span-3"
                    rows={10}
                    placeholder="Enter your custom template text here..."
                  />
                </div>
              )}

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
                    Client Name
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
                    Client Email
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
                <Button onClick={handleAddToHalo} variant="secondary">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Add to Halo
                </Button>
                <Button onClick={handleSendForSigning}>
                  <Send className="h-4 w-4 mr-2" />
                  Send for Signing & Download
                </Button>
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
                <Button onClick={handlePreview} variant="secondary">
                  <FileText className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleAddToHalo} variant="secondary">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Add to Halo
                </Button>
                <Button onClick={handleSendForSigning}>
                  <Send className="h-4 w-4 mr-2" />
                  Send for Signing & Download
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
