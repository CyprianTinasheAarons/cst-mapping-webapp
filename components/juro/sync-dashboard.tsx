"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
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
  Eye,
  File,
  ExternalLink,
  Settings,
  Pen,
  Eraser,
  Lightbulb,
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
  fetchJuroTemplates,
  fetchJuroTemplate,
  createJuroContract,
  getClientDocumentLinks as fetchClientDocumentLinks,
  createDocumentLink,
  getUserSettings,
  createOrUpdateUserSettings,
  signContract,
  sendContractForSigning,
  downloadContractPdf,
} from "@/slices/juro/juroSlice";
import {
  fetchHaloClients,
  fetchHaloContracts,
  fetchHaloClientById,
} from "@/slices/halo/haloSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
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
import { JuroContractCreator } from "./juroContractCreator";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@radix-ui/react-select";

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

// Add a utility for debouncing
const useDebounce = (fn: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        fn(...args);
      }, delay);
    },
    [fn, delay]
  );
};

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
  const [templateAnswers, setTemplateAnswers] = useState<
    Array<{ uid: string; value: string }>
  >([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedSignatureProvider, setSelectedSignatureProvider] =
    useState("docusign");
  const [customTemplate, setCustomTemplate] = useState("");
  const [documentStatus, setDocumentStatus] = useState<Record<string, string>>(
    {}
  );
  const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({});
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

  // PDF Preview states
  const [previewData, setPreviewData] = useState<ArrayBuffer | null>(null);
  const [previewFilename, setPreviewFilename] = useState<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Add caching and rate limit states
  const [templateCache, setTemplateCache] = useState<Record<string, any>>({});
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitResetTime, setRateLimitResetTime] = useState<Date | null>(
    null
  );
  const [apiCallsInProgress, setApiCallsInProgress] = useState<
    Record<string, boolean>
  >({});
  const lastApiCallTimestamps = useRef<Record<string, number>>({});

  // Minimum time between API calls (in ms)
  const API_CALL_COOLDOWN = 500;

  // State for signature modal
  const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false);
  const [signatureData, setSignatureData] = useState<string>("");
  const [signingInProgress, setSigningInProgress] = useState<boolean>(false);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);

  // Settings state
  const [autoSendForSigning, setAutoSendForSigning] = useState<boolean>(false);
  const [defaultSignatoryEmail, setDefaultSignatoryEmail] =
    useState<string>("");

  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  const dispatch = useAppDispatch();

  const {
    clients: haloClients,
    status: haloStatus,
    contracts: haloContracts,
    clientById: detailedClientData,
  } = useAppSelector((state) => state.halo);

  const { templates: juroTemplates, status: juroStatus } = useAppSelector(
    (state) => state.juro
  );

  const documentLinks = useAppSelector((state) => state.juro.documentLinks);

  // Function to safely make API calls with rate limiting protection
  const safeApiCall = useCallback(
    async (
      callName: string,
      apiFunction: () => Promise<any>,
      onSuccess: (data: any) => void,
      onError: (error: any) => void
    ) => {
      // Check if we're currently rate limited
      if (isRateLimited) {
        const now = new Date();
        if (rateLimitResetTime && now < rateLimitResetTime) {
          const secondsToWait = Math.ceil(
            (rateLimitResetTime.getTime() - now.getTime()) / 1000
          );
          toast.warning(
            `API rate limit reached. Please wait ${secondsToWait} seconds before trying again.`
          );
          return;
        } else {
          setIsRateLimited(false);
        }
      }

      // Check if this specific API call is already in progress
      if (apiCallsInProgress[callName]) {
        console.log(
          `API call "${callName}" already in progress, skipping duplicate call`
        );
        return;
      }

      // Check if we need to wait before making another API call
      const now = Date.now();
      const lastCallTime = lastApiCallTimestamps.current[callName] || 0;
      const timeSinceLastCall = now - lastCallTime;

      if (timeSinceLastCall < API_CALL_COOLDOWN) {
        console.log(
          `Throttling API call "${callName}" - too soon after last call`
        );
        setTimeout(() => {
          safeApiCall(callName, apiFunction, onSuccess, onError);
        }, API_CALL_COOLDOWN - timeSinceLastCall);
        return;
      }

      // Mark this API call as in progress
      setApiCallsInProgress((prev) => ({ ...prev, [callName]: true }));
      lastApiCallTimestamps.current[callName] = now;

      try {
        const response = await apiFunction();
        onSuccess(response);
      } catch (error: any) {
        // Check if this is a rate limit error (status 429)
        if (error.response && error.response.status === 429) {
          // Get the reset time from headers if available
          const resetTimeHeader =
            error.response.headers["x-rate-limit-reset"] ||
            error.response.headers["Retry-After"];

          if (resetTimeHeader) {
            const resetTime = new Date();
            resetTime.setSeconds(
              resetTime.getSeconds() + parseInt(resetTimeHeader)
            );
            setRateLimitResetTime(resetTime);
          } else {
            // Default to 60 seconds if no header provided
            const resetTime = new Date();
            resetTime.setSeconds(resetTime.getSeconds() + 60);
            setRateLimitResetTime(resetTime);
          }

          setIsRateLimited(true);
          toast.error("API rate limit exceeded. Please try again later.");
        } else {
          onError(error);
        }
      } finally {
        setApiCallsInProgress((prev) => ({ ...prev, [callName]: false }));
      }
    },
    [isRateLimited, rateLimitResetTime, apiCallsInProgress]
  );

  // Load templates with caching
  const loadTemplates = useCallback(() => {
    safeApiCall(
      "fetchTemplates",
      () => dispatch(fetchJuroTemplates()).unwrap(),
      (templates) => {
        if (templates.length > 0) {
          console.log(`Loaded ${templates.length} templates from Juro API`);
        } else {
          toast.warning(
            "No templates available. Please create templates in Juro first."
          );
        }
      },
      (error) => {
        console.error("Failed to load templates:", error);
        toast.error(
          "Failed to connect to Juro API. Please check your connection."
        );
      }
    );
  }, [safeApiCall, dispatch]);

  // Load template details with caching
  const loadTemplateDetails = useCallback(
    (templateId: string) => {
      // Check if the template is already in the cache
      if (templateCache[templateId]) {
        console.log(`Using cached template: ${templateId}`);
        processTemplateDetails(templateCache[templateId]);
        setIsLoadingTemplate(false);
        return;
      }

      setIsLoadingTemplate(true);

      safeApiCall(
        `fetchTemplate_${templateId}`,
        () => dispatch(fetchJuroTemplate(templateId)).unwrap(),
        (template) => {
          // Cache the template for future use
          setTemplateCache((prev) => ({
            ...prev,
            [templateId]: template,
          }));
          setIsLoadingTemplate(false);
        },
        (error) => {
          console.error(`Error loading template ${templateId}:`, error);
          toast.error("Failed to load template details.");
          setIsLoadingTemplate(false);
        }
      );
    },
    [templateCache, dispatch, safeApiCall]
  );

  // Replace your existing debouncedCreateDocument function with this improved version
  const debouncedCreateDocument = useDebounce(() => {
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
        selectedClient
      );

      safeApiCall(
        "createContract",
        () => dispatch(createJuroContract(requestData)).unwrap(),
        (contract) => {
          setDocumentCreated(true);
          if (contract && contract.id) {
            setCreatedDocumentId(contract.id.toString());
            setDocumentCreated(true);
            setIsCreatingDocument(false);
            setDocumentStatus({
              ...documentStatus,
              [contract.id]: contract.status || "Draft",
            });

            // Generate and store document URLs
            const internalUrl = `https://app.juro.com/sign/${contract.id}`;
            const previewUrl =
              contract.sharingUrl || `https://app.juro.com/${contract.id}`;

            // Update document URLs state
            setDocumentUrls({
              ...documentUrls,
              [contract.id]: {
                internal: internalUrl,
                preview: previewUrl,
              },
            });

            // Save to local storage if client is selected
            if (selectedClient && selectedClient.id) {
              saveDocumentUrlToDatabase(
                selectedClient.id.toString(),
                contract.id.toString(),
                internalUrl,
                documentTitle
              );
              // Re-fetch document links to ensure the Redux store is updated
              dispatch(fetchClientDocumentLinks(selectedClient.id.toString()));
            }

            setDocumentCreated(true);

            toast.success(
              <div>
                <div>Document created successfully!</div>
                <a
                  href={internalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline hover:text-primary"
                >
                  Open in Juro
                </a>
              </div>
            );

            // Show signature modal for internal signing
            setShowSignatureModal(true);
            setDocumentCreated(true);
            // Refresh contracts list with a delay to avoid rate limiting
            setTimeout(() => {
              dispatch(fetchHaloContracts());
            }, 2000);
          } else {
            toast.error("Failed to create document: No ID returned");
            setIsCreatingDocument(false);
          }
        },
        (error) => {
          console.error("Error creating document:", error);

          // Provide helpful error feedback
          if (error.response && error.response.data) {
            const errorMessage =
              error.response.data.detail ||
              error.response.data.message ||
              "Unknown error";

            // Display the main error
            toast.error(`Failed to create document: ${errorMessage}`);

            // If it's a signing side error, provide more context
            if (errorMessage.includes("Invalid question signing side")) {
              toast.info(
                "This is a signing side issue - only send answers for your organization's questions"
              );
            }

            // Display any additional errors
            if (error.response.data.errors) {
              Object.entries(error.response.data.errors).forEach(
                ([field, message]) => {
                  toast.error(`${field}: ${message}`);
                }
              );
            }
          } else {
            toast.error(
              `Failed to create document: ${error.message || "Unknown error"}`
            );
          }
          setIsCreatingDocument(false);
        }
      );
    } catch (error: any) {
      console.error("Error preparing contract data:", error);
      toast.error(
        `Error preparing contract: ${error.message || "Unknown error"}`
      );
      setIsCreatingDocument(false);
    }
  }, 500);

  // Also update the send for signing function
  const debouncedSendForSigning = useDebounce(() => {
    if (!createdDocumentId) {
      toast.error("Please create the document first");
      return;
    }

    try {
      // Use the helper to create a signing request
      const signingData = JuroContractCreator.createSigningRequest(
        documentFields,
        templateFields,
        selectedClient,
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

      // Log signing details
      console.log("Sending contract for signing:", signingData);

      safeApiCall(
        `sendForSigning_${createdDocumentId}`,
        () =>
          dispatch(
            sendContractForSigning({
              contractId: createdDocumentId,
              signingUid: "primary",
              data: signingData,
            })
          ).unwrap(),
        (signingResult) => {
          if (signingResult) {
            const documentId = signingResult.id || createdDocumentId;
            setDocumentStatus({
              ...documentStatus,
              [documentId]: "Sent for signature",
            });

            toast.success(
              `Document "${documentTitle}" sent for signing to ${signingData.recipients[0].email}`
            );
            setIsDocumentDialogOpen(false);

            // Refresh contract list with delay
            setTimeout(() => {
              dispatch(fetchHaloContracts());
            }, 2000);
          }
        },
        (error) => {
          console.error("Error sending document for signing:", error);

          if (error.response && error.response.data) {
            const errorMessage =
              error.response.data.detail ||
              error.response.data.message ||
              "Unknown error";
            toast.error(`Failed to send document for signing: ${errorMessage}`);
          } else {
            toast.error(
              `Failed to send document for signing: ${
                error.message || "Unknown error"
              }`
            );
          }
        }
      );
    } catch (error: any) {
      console.error("Error preparing document for signing:", error);
      toast.error(
        `Failed to send document: ${error.message || "Please try again."}`
      );
    }
  }, 500);

  // Use the loadTemplates function in the useEffect
  useEffect(() => {
    if (haloStatus === "idle") {
      dispatch(fetchHaloClients());
      dispatch(fetchHaloContracts());
      loadTemplates();
    }
  }, [haloStatus, dispatch, loadTemplates]);

  // Handle when template details are fetched - keep the caching logic
  useEffect(() => {
    if (selectedTemplate && detailedClientData) {
      const template = juroTemplates.find((t) => t.id === selectedTemplate);
      if (template) {
        processTemplateDetails(template);
      }

      // Cache the template
      setTemplateCache((prev) => ({
        ...prev,
        [selectedTemplate]: template,
      }));

      setIsLoadingTemplate(false);
    }
  }, [selectedTemplate, detailedClientData, juroTemplates]);

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

  // Add this to your useEffect that loads initial data
  useEffect(() => {
    // Load user settings from database (replace with actual API call)
    const loadUserSettings = async () => {
      try {
        // This would be replaced with an actual API call to your database
        // For now, we'll fall back to localStorage for demo purposes
        const settingsStr = localStorage.getItem("user_settings");
        if (settingsStr) {
          const settings = JSON.parse(settingsStr);
          setAutoSendForSigning(settings.autoSendForSigning || false);
          setDefaultSignatoryEmail(settings.defaultSignatoryEmail || "");
        }
      } catch (error) {
        console.error("Error loading user settings:", error);
      }
    };

    loadUserSettings();
  }, []);

  // Save user settings
  const saveUserSettings = useCallback(async () => {
    try {
      // This would be replaced with an actual API call to your database
      // For now, we'll save to localStorage for demo purposes
      const settings = {
        autoSendForSigning,
        defaultSignatoryEmail,
      };
      localStorage.setItem("user_settings", JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving user settings:", error);
    }
  }, [autoSendForSigning, defaultSignatoryEmail]);

  const processTemplateDetails = (template: any) => {
    // Check template version compatibility
    if (template.version && parseInt(template.version) > 2) {
      toast.warning(
        `Template version ${template.version} may have features not fully supported by this application.`
      );
    }
    console.log("Processing template:", template.name);

    // Set template fields
    setTemplateFields(template.fields || []);
    setTemplateQuestions(template.questions || []);

    // Create initial document fields based on template fields and client data
    const initialFields: Record<string, string> = {};

    // First, log the structure of the template questions and fields for debugging
    console.log("Template questions:", template.questions);
    console.log("Template fields:", template.fields);

    // Add special fields required by Juro
    initialFields.signatory_name = "Shane Thorne";
    initialFields.signatory_email = "s.thorne@cst.co.uk";

    // Handle counterparty_legal_name if it exists in template questions
    if (
      selectedClient &&
      template.questions &&
      Array.isArray(template.questions)
    ) {
      const counterpartyLegalNameQuestion = template.questions.find(
        (q: TemplateQuestion) => q.uid === "counterparty_legal_name"
      );

      if (counterpartyLegalNameQuestion) {
        initialFields.counterparty_legal_name = selectedClient.name;
      }
    }

    // Map client data to template fields using the correct UIDs
    if (selectedClient && template.fields) {
      const clientData = detailedClientData || selectedClient;

      // Look for specific field UIDs from the template
      template.fields.forEach((field: TemplateField) => {
        // Handle known field UIDs based on the comparison table
        switch (field.uid) {
          // Term field
          case "6128253a-93dc-4d83-b972-bb9497513843":
            initialFields[field.uid] = field.value || "12-Month";
            break;

          // Counterparty Contact Name
          case "73aa33aa-7469-41a4-9fff-76bb84a88fdd":
            initialFields[field.uid] =
              clientData.accountsfirstname && clientData.accountslastname
                ? `${clientData.accountsfirstname} ${clientData.accountslastname}`
                : clientData.main_contact_name || "";
            break;

          // Counterparty Address
          case "2b82a989-7eee-4783-a544-2acec331cc84":
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
            break;

          // Counterparty Contact Email
          case "2fff3269-19c6-4d02-9c78-d04156991bfb":
            initialFields[field.uid] =
              clientData.accountsemailaddress || clientData.email || "";
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
            initialFields[field.uid] = "";
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
            initialFields[field.uid] = clientData.accountstitle || "";
            break;

          // Counterparty (Company)
          case "a50f21ec-0dd8-47dc-950b-15032103c63b":
            initialFields[field.uid] = clientData.name || "";
            break;

          default:
            // For any other template fields, use default values if available
            if (field.value) {
              initialFields[field.uid] = field.value;
            }

            // Try to intelligently map fields based on titles
            const fieldTitle = field.title?.toLowerCase() || "";
            if (
              fieldTitle.includes("counterparty") ||
              fieldTitle.includes("client")
            ) {
              if (
                fieldTitle.includes("name") ||
                fieldTitle.includes("company")
              ) {
                initialFields[field.uid] = clientData.name || "";
              } else if (fieldTitle.includes("address")) {
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
              } else if (fieldTitle.includes("email")) {
                initialFields[field.uid] =
                  clientData.accountsemailaddress || clientData.email || "";
              } else if (fieldTitle.includes("phone")) {
                initialFields[field.uid] =
                  clientData.main_phonenumber || clientData.phone || "";
              }
            }
        }
      });
    }

    // Set the document title based on template and client
    setDocumentTitle(`${template.name} - ${selectedClient?.name || ""}`);

    // Update document fields
    setDocumentFields(initialFields);

    console.log("Initialized document fields:", initialFields);
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

    // Fetch document links for this specific client when opening the document dialog
    if (client && client.id) {
      dispatch(fetchClientDocumentLinks(client.id.toString()));
    }

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
    setDocumentCreated(false);
    setCreatedDocumentId(null);
    setValidationErrors([]);

    if (templateId !== "custom") {
      // Use cached template if available, otherwise fetch
      if (templateCache[templateId]) {
        console.log(`Using cached template: ${templateId}`);
        processTemplateDetails(templateCache[templateId]);
        return;
      }

      setIsLoadingTemplate(true);
      loadTemplateDetails(templateId);
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

    // Validate document title
    if (!documentTitle.trim()) {
      errors.push("Document title is required");
    }

    // Validate special questions that don't have field mappings
    templateQuestions.forEach((question) => {
      if (question.isRequired && !question.fieldUid) {
        // Skip validation for signatory fields as they have defaults
        if (["signatory_name", "signatory_email"].includes(question.uid)) {
          return;
        }

        // Check if counterparty_legal_name has a value
        if (
          question.uid === "counterparty_legal_name" &&
          !documentFields[question.uid]?.trim()
        ) {
          errors.push(
            `${question.title || "Counterparty Legal Name"} is required`
          );
        }

        // For other special questions
        else if (!documentFields[question.uid]?.trim()) {
          errors.push(`${question.title} is required`);
        }
      }
    });

    // Validate required template fields that have field mappings
    templateQuestions.forEach((question) => {
      if (question.isRequired && question.fieldUid) {
        // Find the corresponding field
        const field = templateFields.find((f) => f.uid === question.fieldUid);

        // Skip validation for fields that the current signing side isn't responsible for
        const isOurQuestion =
          !question.signingSideUids ||
          question.signingSideUids.length === 0 ||
          question.signingSideUids.includes(
            "079c85c7-9cad-46e1-a3f8-c68af9026f0c"
          ); // CST side UID

        if (!isOurQuestion) {
          return; // Skip validation for questions not on our side
        }

        if (!documentFields[question.fieldUid]?.trim()) {
          const fieldTitle =
            field?.title || question.title || question.fieldUid;
          errors.push(`${fieldTitle} is required`);
        }
      }
    });

    // Log validation results for debugging
    if (errors.length > 0) {
      console.log("Validation errors:", errors);

      // Show errors as toasts
      errors.forEach((error) => {
        toast.error(error);
      });
    } else {
      console.log("Document validation passed");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handlePreview = () => {
    if (!createdDocumentId) {
      toast.error("Please create the document first");
      return;
    }

    safeApiCall(
      `previewPdf_${createdDocumentId}`,
      () => dispatch(downloadContractPdf(createdDocumentId)).unwrap(),
      (response: any) => {
        // Extract filename from content-disposition header if available
        let filename = `${documentTitle.replace(/\s+/g, "_")}.pdf`;
        const contentDisposition = response.headers?.["content-disposition"];
        if (contentDisposition) {
          const filenameMatch = /filename="(.+?)"/.exec(contentDisposition);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }

        setPreviewData(response.data);
        setPreviewFilename(filename);
        setShowPreview(true);
      },
      (error: any) => {
        console.error("Error previewing document:", error);
        toast.error(
          `Failed to preview document: ${error.message || "Unknown error"}`
        );
      }
    );
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewData(null);
  };

  const handleCreateDocument = () => {
    debouncedCreateDocument();
  };

  const handleSendForSigning = () => {
    debouncedSendForSigning();
  };

  const handleDownload = () => {
    if (!createdDocumentId) {
      toast.error("Please create the document first");
      return;
    }

    safeApiCall(
      `downloadPdf_${createdDocumentId}`,
      () => dispatch(downloadContractPdf(createdDocumentId)).unwrap(),
      (response: any) => {
        // Extract filename from content-disposition header if available
        let filename = `${documentTitle.replace(/\s+/g, "_")}.pdf`;
        const contentDisposition = response.headers?.["content-disposition"];
        if (contentDisposition) {
          const filenameMatch = /filename="(.+?)"/.exec(contentDisposition);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }

        // Create a blob from the arraybuffer data
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success(`Document "${filename}" downloaded`);
      },
      (error: any) => {
        console.error("Error downloading document:", error);
        toast.error(
          `Failed to download document: ${error.message || "Unknown error"}`
        );
      }
    );
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
    // Fetch document links when opening contract dialog
    if (client && client.id) {
      dispatch(fetchClientDocumentLinks(client.id.toString()));
    }
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

  // Get question by UID
  const getQuestionByUid = (uid: string) => {
    return templateQuestions.find((q) => q.uid === uid);
  };

  // Group template fields by category
  const groupFieldsByCategory = () => {
    const groups: Record<string, TemplateField[]> = {
      contract: [],
      client: [],
      cst: [],
      dates: [],
      other: [],
    };

    templateFields.forEach((field) => {
      const title = field.title.toLowerCase();

      if (title.includes("counterparty") || title.includes("client")) {
        groups.client.push(field);
      } else if (title.includes("cst") || title.includes("supplier")) {
        groups.cst.push(field);
      } else if (title.includes("date") || title.includes("term")) {
        groups.dates.push(field);
      } else if (title.includes("contract") || title.includes("quote")) {
        groups.contract.push(field);
      } else {
        groups.other.push(field);
      }
    });

    return groups;
  };

  // Add a status indicator to show when rate limited or API calls in progress
  const isAnyApiCallInProgress =
    Object.values(apiCallsInProgress).some(Boolean);

  // Current user ID - in a real app, this would come from auth
  const currentUserId = "current_user";

  // Load user settings
  useEffect(() => {
    dispatch(getUserSettings(currentUserId))
      .unwrap()
      .then((settings) => {
        if (settings) {
          setAutoSendForSigning(settings.auto_send_for_signing || false);
          setDefaultSignatoryEmail(settings.default_signatory_email || "");
        }
      })
      .catch((error) => {
        console.error("Error loading user settings:", error);
      });
  }, [dispatch]);

  // Handle settings update
  const handleSaveSettings = useCallback(() => {
    const settingsData = {
      auto_send_for_signing: autoSendForSigning,
      default_signatory_email: defaultSignatoryEmail,
    };

    dispatch(
      createOrUpdateUserSettings({ userId: currentUserId, data: settingsData })
    )
      .unwrap()
      .then(() => {
        toast.success("Settings saved successfully");
        setIsSettingsDialogOpen(false);
      })
      .catch((error) => {
        console.error("Error saving settings:", error);
        toast.error(`Failed to save settings: ${error}`);
      });
  }, [dispatch, autoSendForSigning, defaultSignatoryEmail, currentUserId]);

  // Database-backed document URL saving
  const saveDocumentUrlToDatabase = useCallback(
    async (
      clientId: string,
      documentId: string,
      documentUrl: string,
      documentTitle: string
    ) => {
      if (!clientId || !documentId || !documentUrl) {
        console.error("Missing required parameters for saving document URL");
        return;
      }

      try {
        const documentData = {
          document_id: documentId,
          document_url: documentUrl,
          document_title: documentTitle,
          status: "Created",
          created_at: new Date().toISOString(),
        };

        // Save to the database using Redux thunk
        await dispatch(
          createDocumentLink({ clientId, data: documentData })
        ).unwrap();

        console.log(`Saved document URL for client ${clientId}:`, documentUrl);
      } catch (error) {
        console.error("Error saving document URL to database:", error);
      }
    },
    [dispatch]
  );

  const getClientDocumentUrls = (clientId: string) => {
    return documentLinks[clientId] || [];
  };

  // Handle signature capture clear
  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureData("");
    }
  };

  // Handle signature capture
  const captureSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      // Remove the 'data:image/png;base64,' part if it exists
      const dataUrl = canvas.toDataURL("image/png").split(",")[1];
      setSignatureData(dataUrl);
    }
  };

  // Handle signing the contract internally
  const handleInternalSign = () => {
    if (!signatureData) {
      toast.error("Please provide a signature");
      return;
    }

    if (!createdDocumentId) {
      toast.error("No document available to sign");
      return;
    }

    setSigningInProgress(true);

    // Prepare signature data
    const signData = {
      signatureBase64: signatureData,
      name: "Internal Signatory",
    };

    // Call the API to sign the contract
    safeApiCall(
      `signContract_${createdDocumentId}`,
      () =>
        dispatch(
          signContract({ contractId: createdDocumentId, data: signData })
        ).unwrap(),
      (result) => {
        toast.success("Contract signed successfully");
        setShowSignatureModal(false);
        setSigningInProgress(false);

        // Update document status
        setDocumentStatus({
          ...documentStatus,
          [createdDocumentId]: "Signed",
        });

        // If auto-send for signing is enabled, send to counterparty
        if (autoSendForSigning && defaultSignatoryEmail) {
          // Automatically send for signing
          handleAutoSendForSigning(createdDocumentId, defaultSignatoryEmail);
        }
      },
      (error) => {
        console.error("Error signing contract:", error);
        toast.error(
          `Failed to sign contract: ${error.message || "Unknown error"}`
        );
        setSigningInProgress(false);
      }
    );
  };

  // Function to automatically send for signing
  const handleAutoSendForSigning = (documentId: string, email: string) => {
    if (!documentId || !email) {
      console.error("Missing document ID or email for auto-sending");
      return;
    }

    // Prepare signing data
    const signingData = {
      provider: selectedSignatureProvider,
      recipients: [
        {
          email: email,
          name: selectedClient?.name || "Counterparty Signatory",
          role: "Signatory",
        },
      ],
    };

    // Call the API to send for signing
    safeApiCall(
      `sendForSigning_${documentId}`,
      () =>
        dispatch(
          sendContractForSigning({
            contractId: documentId,
            signingUid: "primary",
            data: signingData,
          })
        ).unwrap(),
      (signingResult) => {
        if (signingResult) {
          setDocumentStatus({
            ...documentStatus,
            [documentId]: "Sent for signature",
          });

          toast.success(`Document automatically sent for signing to ${email}`);

          // Refresh contract list with delay
          setTimeout(() => {
            dispatch(fetchHaloContracts());
          }, 2000);
        }
      },
      (error) => {
        console.error("Error auto-sending document for signing:", error);
        toast.error(
          `Failed to auto-send document for signing: ${
            error.message || "Unknown error"
          }`
        );
      }
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Add API status indicator for debugging */}
      {(isRateLimited || isAnyApiCallInProgress) && (
        <div
          className={`fixed bottom-4 right-4 p-2 rounded-md z-50 ${
            isRateLimited ? "bg-red-500" : "bg-yellow-500"
          } text-white text-sm`}
        >
          {isRateLimited ? (
            <span>
              Rate limited - reset in{" "}
              {rateLimitResetTime
                ? Math.ceil(
                    (rateLimitResetTime.getTime() - new Date().getTime()) / 1000
                  )
                : "??"}{" "}
              seconds
            </span>
          ) : (
            <span>API calls in progress...</span>
          )}
        </div>
      )}

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
                              onClick={() => handleOpenDocument(client)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Document
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={`https://cstltd.halopsa.com/customers?mainview=client&inactive=false&hideinternal=false&serviceaccounts=true&nonserviceaccounts=true&clientid=${client.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Halo PSA
                              </a>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="space-x-1"
                              onClick={() => handleViewContracts(client)}
                            >
                              <File className="h-3.5 w-3.5" />
                              <span>Documents</span>
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

              {/* Form fields rendering */}
              {templateFields.length > 0 && !isPreviewMode && (
                <>
                  <div className="border rounded-md p-4 mt-2">
                    <h3 className="text-sm font-medium mb-3">
                      Document Information
                    </h3>
                    <div className="grid grid-cols-4 items-center gap-4 mb-2">
                      <Label htmlFor="title" className="text-right">
                        Document Title<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={documentTitle}
                        onChange={(e) => setDocumentTitle(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4 mb-2">
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
                  </div>

                  {/* Display special questions that don't have field mappings */}
                  {templateQuestions.filter(
                    (q) =>
                      !q.fieldUid &&
                      !["signatory_name", "signatory_email"].includes(q.uid)
                  ).length > 0 && (
                    <div className="border rounded-md p-4 mt-2">
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
                                className="capitalize"
                              >
                                {question.title}
                                {question.isRequired && (
                                  <span className="text-red-500">*</span>
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
                              className="col-span-3"
                              placeholder={`Enter ${question.title.toLowerCase()}`}
                            />
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Group fields by category */}
                  {Object.entries(groupFieldsByCategory()).map(
                    ([category, fields]) =>
                      fields.length > 0 && (
                        <div
                          key={category}
                          className="border rounded-md p-4 mt-2"
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
                                    className="capitalize"
                                  >
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
                                      handleFieldChange(
                                        field.uid,
                                        e.target.value
                                      )
                                    }
                                    className="col-span-3"
                                    rows={3}
                                    placeholder={
                                      field.value ||
                                      `Enter ${field.title.toLowerCase()}`
                                    }
                                  />
                                ) : field.type === "calendar" ? (
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
                                    className="col-span-3"
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
                                    className="col-span-3"
                                    placeholder={
                                      field.value ||
                                      `Enter ${field.title.toLowerCase()}`
                                    }
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )
                  )}

                  {/* Signature Information Section */}
                  <div className="border rounded-md p-4 mt-2">
                    <h3 className="text-sm font-medium mb-3">
                      Signature Information
                    </h3>
                    <div className="grid grid-cols-4 items-center gap-4 mb-2">
                      <Label htmlFor="signatory_name" className="text-right">
                        Signatory Name<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="signatory_name"
                        value={documentFields.signatory_name || "Shane Thorne"}
                        onChange={(e) =>
                          handleFieldChange("signatory_name", e.target.value)
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4 mb-2">
                      <Label htmlFor="signatory_email" className="text-right">
                        Signatory Email<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="signatory_email"
                        type="email"
                        value={
                          documentFields.signatory_email || "s.thorne@cst.co.uk"
                        }
                        onChange={(e) =>
                          handleFieldChange("signatory_email", e.target.value)
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4 mb-2">
                      <Label
                        htmlFor="signature_provider"
                        className="text-right"
                      >
                        Signature Provider
                      </Label>
                      <Select
                        value={selectedSignatureProvider}
                        onValueChange={setSelectedSignatureProvider}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select signature provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="docusign">DocuSign</SelectItem>
                          <SelectItem value="hellosign">HelloSign</SelectItem>
                          <SelectItem value="adobesign">Adobe Sign</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
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
                    <Button variant="outline" className="mr-2" asChild>
                      <a
                        href={`https://app.juro.com/sign/${createdDocumentId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Juro
                      </a>
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
                {!documentCreated && (
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
                )}

                {documentCreated && (
                  <>
                    <Button variant="outline" className="mr-2" asChild>
                      <a
                        href={`https://app.juro.com/sign/${createdDocumentId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Juro
                      </a>
                    </Button>
                  </>
                )}
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
        <DialogContent className="sm:max-w-xl">
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
                <TableHead>Document Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientContracts.length > 0 ||
              (selectedClient &&
                documentLinks[selectedClient.id]?.length > 0) ? (
                <>
                  {/* Show Halo contracts */}
                  {clientContracts.map((contract) => (
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
                  ))}

                  {/* Show document links from Redux store */}
                  {selectedClient &&
                    documentLinks[selectedClient.id]?.map((docLink) => (
                      <TableRow key={docLink.document_id}>
                        <TableCell className="font-medium">
                          {docLink.document_title || "Untitled Document"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {docLink.status || "Created"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {docLink.created_at
                            ? new Date(docLink.created_at).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={docLink.document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </>
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

          {/* Debug information for document links */}
          {selectedClient && (
            <div className="mt-4 text-xs text-muted-foreground">
              <p>ClientID: {selectedClient.id}</p>
              <p>
                Document Links: {documentLinks[selectedClient.id]?.length || 0}{" "}
                found
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ToastContainer />

      {/* Signature Modal */}
      {showSignatureModal && (
        <Dialog open={showSignatureModal} onOpenChange={setShowSignatureModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <span className="bg-gradient-to-r from-primary to-blue-600 p-2 rounded-full">
                  <Pen className="h-5 w-5 text-white" />
                </span>
                Internal Signature Required
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                Please sign the document to proceed with the contract workflow.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <FileText className="h-4 w-4 mr-2" />
                <span className="font-medium">{documentTitle}</span>
              </div>

              <Separator className="my-3" />

              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="signature-canvas"
                    className="text-base mb-2 block"
                  >
                    Draw your signature below
                  </Label>
                  <div className="bg-secondary/20 rounded-lg p-4">
                    <div className="bg-white border-2 border-dashed border-primary/40 rounded-md overflow-hidden">
                      <canvas
                        id="signature-canvas"
                        ref={signatureCanvasRef}
                        width={500}
                        height={180}
                        className="w-full touch-none cursor-crosshair"
                        onMouseDown={(e) => {
                          const canvas = signatureCanvasRef.current;
                          if (canvas) {
                            const ctx = canvas.getContext("2d");
                            if (ctx) {
                              ctx.beginPath();

                              // Set up drawing properties for better signature experience
                              ctx.lineWidth = 2.5;
                              ctx.lineCap = "round";
                              ctx.lineJoin = "round";
                              ctx.strokeStyle = "#1a1a1a";

                              // Get mouse position
                              const rect = canvas.getBoundingClientRect();
                              const scaleX = canvas.width / rect.width;
                              const scaleY = canvas.height / rect.height;

                              let lastX = (e.clientX - rect.left) * scaleX;
                              let lastY = (e.clientY - rect.top) * scaleY;

                              ctx.moveTo(lastX, lastY);

                              const handleMove = (e: MouseEvent) => {
                                if (ctx) {
                                  const currentX =
                                    (e.clientX - rect.left) * scaleX;
                                  const currentY =
                                    (e.clientY - rect.top) * scaleY;

                                  // Use quadratic curves for smoother signature
                                  ctx.quadraticCurveTo(
                                    lastX,
                                    lastY,
                                    (lastX + currentX) / 2,
                                    (lastY + currentY) / 2
                                  );

                                  lastX = currentX;
                                  lastY = currentY;
                                  ctx.stroke();
                                }
                              };

                              const handleEnd = () => {
                                document.removeEventListener(
                                  "mousemove",
                                  handleMove
                                );
                                document.removeEventListener(
                                  "mouseup",
                                  handleEnd
                                );
                                captureSignature();
                              };

                              document.addEventListener(
                                "mousemove",
                                handleMove
                              );
                              document.addEventListener("mouseup", handleEnd);
                            }
                          }
                        }}
                        // Add touch support for mobile devices
                        onTouchStart={(e) => {
                          e.preventDefault();
                          const canvas = signatureCanvasRef.current;
                          if (canvas) {
                            const ctx = canvas.getContext("2d");
                            if (ctx && e.touches[0]) {
                              ctx.beginPath();

                              // Set up drawing properties
                              ctx.lineWidth = 2.5;
                              ctx.lineCap = "round";
                              ctx.lineJoin = "round";
                              ctx.strokeStyle = "#1a1a1a";

                              // Get touch position
                              const rect = canvas.getBoundingClientRect();
                              const scaleX = canvas.width / rect.width;
                              const scaleY = canvas.height / rect.height;

                              let lastX =
                                (e.touches[0].clientX - rect.left) * scaleX;
                              let lastY =
                                (e.touches[0].clientY - rect.top) * scaleY;

                              ctx.moveTo(lastX, lastY);

                              const handleTouchMove = (e: TouchEvent) => {
                                e.preventDefault();
                                if (ctx && e.touches[0]) {
                                  const currentX =
                                    (e.touches[0].clientX - rect.left) * scaleX;
                                  const currentY =
                                    (e.touches[0].clientY - rect.top) * scaleY;

                                  // Use quadratic curves for smoother signature
                                  ctx.quadraticCurveTo(
                                    lastX,
                                    lastY,
                                    (lastX + currentX) / 2,
                                    (lastY + currentY) / 2
                                  );

                                  lastX = currentX;
                                  lastY = currentY;
                                  ctx.stroke();
                                }
                              };

                              const handleTouchEnd = () => {
                                canvas.removeEventListener(
                                  "touchmove",
                                  handleTouchMove
                                );
                                canvas.removeEventListener(
                                  "touchend",
                                  handleTouchEnd
                                );
                                captureSignature();
                              };

                              canvas.addEventListener(
                                "touchmove",
                                handleTouchMove
                              );
                              canvas.addEventListener(
                                "touchend",
                                handleTouchEnd
                              );
                            }
                          }
                        }}
                      />
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <p className="text-xs text-muted-foreground italic">
                        Sign above using mouse or touch
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSignature}
                        className="h-8 text-xs"
                      >
                        <Eraser className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/40 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-50 p-2 rounded-full">
                      <Lightbulb className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="space-y-1 text-sm">
                      <h4 className="font-medium">What happens next?</h4>
                      <p className="text-muted-foreground">
                        After signing, you can download the document, open it in
                        Juro, or automatically send it for external signing.
                      </p>

                      <div className="flex items-center pt-2">
                        <Switch
                          id="auto-send-modal"
                          checked={autoSendForSigning}
                          onCheckedChange={(checked: boolean) => {
                            setAutoSendForSigning(checked);
                            // Save after changing
                            setTimeout(saveUserSettings, 100);
                          }}
                          className="mr-2"
                        />
                        <Label
                          htmlFor="auto-send-modal"
                          className="text-sm cursor-pointer"
                        >
                          Automatically send for external signing
                        </Label>
                      </div>

                      {autoSendForSigning && (
                        <Input
                          className="mt-2 h-8 text-sm"
                          placeholder="Recipient email address"
                          value={defaultSignatoryEmail}
                          onChange={(e) => {
                            setDefaultSignatoryEmail(e.target.value);
                            // Debounce saving
                            setTimeout(saveUserSettings, 500);
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowSignatureModal(false)}
              >
                Skip for now
              </Button>
              <Button
                onClick={handleInternalSign}
                disabled={signingInProgress || !signatureData}
                className="min-w-[150px]"
              >
                {signingInProgress ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                    Signing...
                  </>
                ) : (
                  <>
                    <Pen className="h-4 w-4 mr-2" />
                    Sign Document
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Settings Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed bottom-4 right-4 z-10"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Document Settings</DialogTitle>
            <DialogDescription>
              Configure your document management preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-send">Auto-send for signing</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically send for signing after internal signature
                </p>
              </div>
              <Switch
                id="auto-send"
                checked={autoSendForSigning}
                onCheckedChange={(checked: boolean) => {
                  setAutoSendForSigning(checked);
                  // Save after changing
                  setTimeout(saveUserSettings, 100);
                }}
                className="mr-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultEmail">Default signatory email</Label>
              <Input
                id="defaultEmail"
                placeholder="client@example.com"
                value={defaultSignatoryEmail}
                onChange={(e) => {
                  setDefaultSignatoryEmail(e.target.value);
                  // Debounce saving
                  setTimeout(saveUserSettings, 500);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Used for auto-sending documents for signing
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
