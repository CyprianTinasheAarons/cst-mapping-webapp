/**
 * Helper to create contracts with proper signing side handling
 */

// Define proper TypeScript interfaces
interface TemplateField {
  uid: string;
  title: string;
  type: string;
  value?: string;
}

interface JuroQuestion {
  uid: string;
  fieldUid?: string;
  isRequired: boolean;
  signingSideUids: string[];
  title: string;
  text: string;
}

interface ClientData {
  oppcompanyname?: string;
  client_name?: string;
  oppcontactname?: string;
  oppemailaddress?: string;
  [key: string]: any;
}

export class JuroContractCreator {
  // Known signing side UIDs from template exploration
  static readonly CST_SIDE_UID = "079c85c7-9cad-46e1-a3f8-c68af9026f0c";
  static readonly COUNTERPARTY_SIDE_UID =
    "f752718c-571a-42ba-8d24-ebe3442a7994";

  /**
   * Creates a contract payload with correct signing side handling
   */
  static createContractPayload(
    templateId: string,
    documentTitle: string,
    documentFields: Record<string, string>,
    templateFields: TemplateField[],
    templateQuestions: JuroQuestion[],
    selectedClient: ClientData
  ): any {
    // Log key data in development only
    if (process.env.NODE_ENV === "development") {
      console.debug("Creating contract with template data:", {
        templateId,
        documentTitle,
        fields: templateFields.length,
        questions: templateQuestions.length,
      });
    }

    // Build a mapping of field UIDs to their corresponding question UIDs
    const fieldToQuestionMap: Record<string, string> = {};
    templateQuestions.forEach((question) => {
      if (question.fieldUid) {
        fieldToQuestionMap[question.fieldUid] = question.uid;
      }
    });

    // Create answers array using question UIDs, NOT field UIDs
    // Simplified filtering logic to be more clear about inclusion criteria
    const answers = templateQuestions
      .filter((question) => {
        // never include these in the contract creation payload
        if (["signatory_name", "signatory_email"].includes(question.uid)) {
          return false;
        }
        // include if either global (no signing sides) or CST side
        return (
          !question.signingSideUids?.length ||
          question.signingSideUids.includes(this.CST_SIDE_UID)
        );
      })
      .map((question) => {
        // Special case for counterparty legal name - use client data directly
        if (question.uid === "counterparty_legal_name") {
          return {
            uid: question.uid,
            value: selectedClient?.oppcompanyname ||
              selectedClient?.client_name ||
              "",
          };
        }

        // If the question is linked to a field in the form, use that value
        if (question.fieldUid && documentFields[question.fieldUid]) {
          return {
            uid: question.uid,
            value: documentFields[question.fieldUid],
          };
        }

        // For required questions without a value, we'll omit them and let the UI validation catch it
        // This prevents sending empty strings that the API will reject
        return null;
      })
      .filter((answer) => answer !== null); // Remove null answers

    // Create the request payload in the EXACT format required by the Juro API
    const requestData = {
      templateId: templateId,
      contract: {
        answers: answers,
        fields: [], // Include empty fields array if needed by the API
        owner: {
          username: "s.thorne@cst.co.uk", // Default owner or from environment
        },
        name: documentTitle,
      },
    };

    // Debug log in development only
    if (process.env.NODE_ENV === "development") {
      console.debug("Contract payload →", requestData);
    }

    return requestData;
  }

  /**
   * Creates a signing request with the correct data structure
   */
  static createSigningRequest(
    documentFields: Record<string, string>,
    templateFields: TemplateField[],
    selectedClient: ClientData,
    detailedClientData: ClientData,
    signatureProvider: string = "docusign"
  ): any {
    // Find the signatory fields
    const signatoryNameField = templateFields.find((field) =>
      field.title.toLowerCase().includes("signatory name")
    );
    const signatoryEmailField = templateFields.find((field) =>
      field.title.toLowerCase().includes("signatory email")
    );

    // Get the contact name and email from either the fields or the client data
    const contactName =
      (signatoryNameField && documentFields[signatoryNameField.uid]) ||
      detailedClientData?.oppcontactname ||
      "";

    const contactEmail =
      (signatoryEmailField && documentFields[signatoryEmailField.uid]) ||
      detailedClientData?.oppemailaddress ||
      "";

    // Create the signing request payload
    const signingData = {
      recipients: [
        {
          email: contactEmail,
          name: contactName,
          provider: signatureProvider,
        },
      ],
    };

    if (process.env.NODE_ENV === "development") {
      console.debug("Signing request payload →", signingData);
    }

    return signingData;
  }
}
