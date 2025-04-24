/**
 * Helper to create contracts with proper signing side handling
 */
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
    templateFields: any[],
    templateQuestions: any[],
    selectedClient: any
  ): any {
    // Log key data for debugging
    console.log("Creating contract with template data:", {
      fields: templateFields.length,
      questions: templateQuestions.length,
    });

    // Build a mapping of field UIDs to their corresponding question UIDs
    const fieldToQuestionMap: Record<string, string> = {};
    templateQuestions.forEach((question) => {
      if (question.fieldUid) {
        fieldToQuestionMap[question.fieldUid] = question.uid;
      }
    });

    console.log("Field to Question mapping:", fieldToQuestionMap);

    // Create answers array using question UIDs, NOT field UIDs
    const answers = templateQuestions
      .filter((question) => {
        // CRITICAL FIX: Skip signatory_name and signatory_email
        // These are handled separately and cause errors when included in answers
        if (
          question.uid === "signatory_name" ||
          question.uid === "signatory_email"
        ) {
          console.log(`Skipping signatory question: ${question.uid}`);
          return false;
        }

        // Skip questions meant for counterparty side only
        if (
          question.signingSideUids &&
          question.signingSideUids.length === 1 &&
          question.signingSideUids[0] === this.COUNTERPARTY_SIDE_UID
        ) {
          console.log(
            `Skipping counterparty-only question: ${question.uid} (${question.title})`
          );
          return false;
        }

        // Include questions that either:
        // 1. Have no signing sides, OR
        // 2. Include the CST side
        return (
          !question.signingSideUids ||
          question.signingSideUids.length === 0 ||
          question.signingSideUids.includes(this.CST_SIDE_UID)
        );
      })
      .map((question) => {
        // Handle special counterparty_legal_name question
        if (question.uid === "counterparty_legal_name") {
          return {
            uid: question.uid,
            value: selectedClient?.name || "",
          };
        }

        // For questions with field UIDs, use the value from documentFields
        if (question.fieldUid && documentFields[question.fieldUid]) {
          return {
            uid: question.uid, // Using question UID, not field UID
            value: documentFields[question.fieldUid] || "",
          };
        }

        // For questions without field UIDs, check if we have a direct answer
        if (documentFields[question.uid]) {
          return {
            uid: question.uid,
            value: documentFields[question.uid] || "",
          };
        }

        // For required questions without a value, provide an empty string
        if (question.isRequired) {
          console.log(
            `Adding required question with empty value: ${question.uid} (${question.title})`
          );
          return {
            uid: question.uid,
            value: "",
          };
        }

        // Skip non-required questions without values
        return null;
      })
      .filter(Boolean); // Remove null entries

    // CRITICAL FIX: Create the final payload WITHOUT signingSides array
    const requestData = {
      templateId: templateId,
      contract: {
        answers: answers,
        owner: {
          name: "Shane Thorne",
          username: "s.thorne@cst.co.uk",
        },
        name: documentTitle,
        // Remove signingSides array entirely
      },
    };

    // Log the final payload for debugging
    console.log("Contract payload:", {
      answers: answers.length,
      requestData: JSON.stringify(requestData, null, 2),
    });

    return requestData;
  }

  /**
   * Prepares a signing request for the counterparty
   */
  static createSigningRequest(
    documentFields: Record<string, string>,
    templateFields: any[],
    selectedClient: any,
    detailedClientData: any,
    selectedSignatureProvider: string
  ): any {
    // Find the counterparty email field
    const counterpartyEmailField = templateFields.find(
      (f) => f.uid === "2fff3269-19c6-4d02-9c78-d04156991bfb"
    );

    // Find the counterparty name field
    const counterpartyNameField = templateFields.find(
      (f) => f.uid === "a50f21ec-0dd8-47dc-950b-15032103c63b"
    );

    // Find the counterparty contact name field
    const counterpartyContactField = templateFields.find(
      (f) => f.uid === "73aa33aa-7469-41a4-9fff-76bb84a88fdd"
    );

    // Try to get email from document fields or client data
    const clientEmail =
      // First try the counterparty email field if it exists
      (counterpartyEmailField && documentFields[counterpartyEmailField.uid]) ||
      // Then try document fields
      documentFields.clientEmail ||
      documentFields.counterparty_email ||
      // Then try client data
      (selectedClient &&
        (selectedClient.email ||
          selectedClient.accountsemailaddress ||
          detailedClientData?.accountsemailaddress)) ||
      "";

    // Try to get client name from document fields or client data
    const clientName =
      // First try selectedClient.name (from Halo)
      selectedClient?.name ||
      // Then try the counterparty name field if it exists
      (counterpartyNameField && documentFields[counterpartyNameField.uid]) ||
      // Then try the counterparty contact name field
      (counterpartyContactField &&
        documentFields[counterpartyContactField.uid]) ||
      // Then try counterparty_legal_name
      documentFields.counterparty_legal_name ||
      "";

    return {
      provider: selectedSignatureProvider,
      recipients: [
        {
          email: clientEmail,
          name: clientName,
          role: "Signatory",
        },
      ],
    };
  }
}
