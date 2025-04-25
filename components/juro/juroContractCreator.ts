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
    const answers = templateQuestions
      .filter((q) => {
        // 1) always include counterparty_legal_name
        if (q.uid === "counterparty_legal_name") return true;

        // 2) never include our internal signatory questions
        if (["signatory_name", "signatory_email"].includes(q.uid)) {
          return false;
        }

        // 3) include global questions or those assigned to the CST side
        return (
          !q.signingSideUids?.length ||
          q.signingSideUids.includes(this.CST_SIDE_UID)
        );
      })
      .map((q) => {
        // special-case the client's legal name
        if (q.uid === "counterparty_legal_name") {
          return {
            uid: q.uid,
            value: selectedClient?.oppcompanyname ||
              selectedClient?.client_name ||
              selectedClient?.name ||
              "",
          };
        }

        // for field-backed questions use documentFields
        if (q.fieldUid && documentFields[q.fieldUid]) {
          return {
            uid: q.uid,
            value: documentFields[q.fieldUid],
          };
        }

        // required questions with no value should be caught by your UI validation
        return null;
      })
      .filter((a) => a !== null);

    // Debug log in development only
    if (process.env.NODE_ENV === "development") {
      console.debug("Contract payload →", {
        templateId,
        answers,
        documentTitle,
      });
    }

    return {
      templateId,
      contract: {
        name: documentTitle,
        owner: { username: "s.thorne@cst.co.uk" },
        answers,
      },
    };
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

export class JuroContractCreatorTwo {
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
    const answers = templateQuestions
      .filter((q) => {
        // 1) always include counterparty_legal_name
        if (q.uid === "counterparty_legal_name") return true;

        // 2) never include our internal signatory questions
        if (["signatory_name", "signatory_email"].includes(q.uid)) {
          return false;
        }

        // 3) include global questions or those assigned to the CST side
        return (
          !q.signingSideUids?.length ||
          q.signingSideUids.includes(this.CST_SIDE_UID)
        );
      })
      .map((q) => {
        // special-case the client's legal name
        if (q.uid === "counterparty_legal_name") {
          return {
            uid: q.uid,
            value: selectedClient?.oppcompanyname ||
              selectedClient?.client_name ||
              selectedClient?.name ||
              "",
          };
        }

        // for field-backed questions use documentFields
        if (q.fieldUid && documentFields[q.fieldUid]) {
          return {
            uid: q.uid,
            value: documentFields[q.fieldUid],
          };
        }

        // required questions with no value should be caught by your UI validation
        return null;
      })
      .filter((a) => a !== null);

    // Debug log in development only
    if (process.env.NODE_ENV === "development") {
      console.debug("Contract payload →", {
        templateId,
        answers,
        documentTitle,
      });
    }

    return {
      templateId,
      contract: {
        name: documentTitle,
        owner: { username: "s.thorne@cst.co.uk" },
        answers,
      },
    };
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
