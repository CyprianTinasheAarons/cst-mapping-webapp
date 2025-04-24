import httpCommon from "./http.common";

/**
 * Check the health status of the Juro API.
 * @returns Promise with health status response
 */
export const checkHealth = () => {
  return httpCommon.get(`/api/juro/v1/health`);
};

/**
 * Create a new contract in Juro.
 * @param data Contract data for creation
 * @returns Promise with created contract object
 */
export const createContract = (data: Record<string, any>) => {
  return httpCommon.post(`/api/juro/v1/contracts`, data);
};

/**
 * Upload a PDF document and create a contract from it.
 * @param contractData Form data containing PDF file and contract metadata
 * @returns Promise with created contract object
 */
export const uploadContractPdf = (contractData: Record<string, any>) => {
  return httpCommon.post(`/api/juro/v1/contracts/upload`, contractData);
};

/**
 * Retrieve a specific contract by ID.
 * @param contractId ID of the contract to retrieve
 * @returns Promise with contract object
 */
export const getContract = (contractId: string) => {
  return httpCommon.get(`/api/juro/v1/contracts/${contractId}`);
};

/**
 * Update an existing contract.
 * @param contractId ID of the contract to update
 * @param data Updated contract data
 * @returns Promise with updated contract object
 */
export const updateContract = (
  contractId: string,
  data: Record<string, any>
) => {
  return httpCommon.patch(`/api/juro/v1/contracts/${contractId}`, data);
};

/**
 * Delete a specific contract.
 * @param contractId ID of the contract to delete
 * @returns Promise with confirmation message
 */
export const deleteContract = (contractId: string) => {
  return httpCommon.delete(`/api/juro/v1/contracts/${contractId}`);
};

/**
 * Sign a contract with a base64 encoded signature image.
 * @param contractId ID of the contract to sign
 * @param data Signature data including base64 encoded signature image and name
 * @returns Promise with confirmation message
 */
export const signContract = (contractId: string, data: Record<string, any>) => {
  return httpCommon.post(`/api/juro/v1/contracts/${contractId}/sign`, data);
};

/**
 * Send a contract for signing to a specific signing side.
 * @param contractId ID of the contract to send for signing
 * @param signingUid UID of the signing side to send to for signing
 * @param data Message data for the signing request
 * @returns Promise with confirmation message
 */
export const sendContractForSigning = (
  contractId: string,
  signingUid: string,
  data: Record<string, any>
) => {
  return httpCommon.post(
    `/api/juro/v1/contracts/${contractId}/signing-request/${signingUid}`,
    data
  );
};

/**
 * Send a contract for signing to a specific signatory within a signing side.
 * @param contractId ID of the contract to send for signing
 * @param signingUid UID of the signing side
 * @param signatureUid UID of the signature to send to for signing
 * @param data Message data for the signing request
 * @returns Promise with confirmation message
 */
export const sendContractForSigningBySignatory = (
  contractId: string,
  signingUid: string,
  signatureUid: string,
  data: Record<string, any>
) => {
  return httpCommon.post(
    `/api/juro/v1/contracts/${contractId}/signing-request/${signingUid}/signatures/${signatureUid}`,
    data
  );
};

/**
 * Download a PDF of a specific contract.
 * @param contractId ID of the contract to download
 * @returns Promise with PDF file as a streaming response
 */
export const downloadContractPdf = (contractId: string) => {
  return httpCommon.get(`/api/juro/v1/contracts/${contractId}/pdf`, {
    responseType: "arraybuffer",
  });
};

/**
 * Retrieve a list of templates from Juro.
 * @returns Promise with list of template objects
 */
export const getTemplates = () => {
  return httpCommon.get(`/api/juro/v1/templates`);
};

/**
 * Retrieve a specific template by ID.
 * @param templateId ID of the template to retrieve
 * @returns Promise with template object containing complete template details
 */
export const getTemplate = (templateId: string) => {
  return httpCommon.get(`/api/juro/v1/templates/${templateId}`);
};

/**
 * Get all document links for a client.
 * @param clientId ID of the client
 * @returns Promise with list of document links
 */
export const getClientDocumentLinks = (clientId: string) => {
  return httpCommon.get(`/api/juro/db/document-links/${clientId}`);
};

/**
 * Create a document link for a client.
 * @param clientId ID of the client
 * @param data Document link data
 * @returns Promise with created document link
 */
export const createDocumentLink = (
  clientId: string,
  data: Record<string, any>
) => {
  return httpCommon.post(`/api/juro/db/document-links/${clientId}`, data);
};

/**
 * Get a specific document link.
 * @param clientId ID of the client
 * @param documentId ID of the document
 * @returns Promise with document link
 */
export const getDocumentLink = (clientId: string, documentId: string) => {
  return httpCommon.get(
    `/api/juro/db/document-links/${clientId}/${documentId}`
  );
};

/**
 * Update a document link.
 * @param clientId ID of the client
 * @param documentId ID of the document
 * @param data Updated document link data
 * @returns Promise with updated document link
 */
export const updateDocumentLink = (
  clientId: string,
  documentId: string,
  data: Record<string, any>
) => {
  return httpCommon.patch(
    `/api/juro/db/document-links/${clientId}/${documentId}`,
    data
  );
};

/**
 * Delete a document link.
 * @param clientId ID of the client
 * @param documentId ID of the document
 * @returns Promise with confirmation message
 */
export const deleteDocumentLink = (clientId: string, documentId: string) => {
  return httpCommon.delete(
    `/api/juro/db/document-links/${clientId}/${documentId}`
  );
};

/**
 * Get user settings.
 * @param userId ID of the user
 * @returns Promise with user settings
 */
export const getUserSettings = (userId: string) => {
  return httpCommon.get(`/api/juro/db/user-settings/${userId}`);
};

/**
 * Create or update user settings.
 * @param userId ID of the user
 * @param data User settings data
 * @returns Promise with created or updated user settings
 */
export const createOrUpdateUserSettings = (
  userId: string,
  data: Record<string, any>
) => {
  return httpCommon.post(`/api/juro/db/user-settings/${userId}`, data);
};

/**
 * Autofill a template.
 * @param data Autofill data including template ID, client ID, and ticket ID
 * @returns Promise with autofill response
 */
export const autofillContract = (data: {
  template_id: string;
  client_id?: number;
  ticket_id?: number;
}) => {
  return httpCommon.post(`/api/juro/v1/autofill`, data);
};

const juroService = {
  checkHealth,
  createContract,
  uploadContractPdf,
  getContract,
  updateContract,
  deleteContract,
  signContract,
  sendContractForSigning,
  sendContractForSigningBySignatory,
  downloadContractPdf,
  getTemplates,
  getTemplate,
  autofillContract,
  getClientDocumentLinks,
  createDocumentLink,
  getDocumentLink,
  updateDocumentLink,
  deleteDocumentLink,
  getUserSettings,
  createOrUpdateUserSettings,
};

export default juroService;
