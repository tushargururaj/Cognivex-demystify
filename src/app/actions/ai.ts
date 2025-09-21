
'use server';

import { VertexAI, HarmCategory, HarmBlockThreshold } from '@google-cloud/vertexai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { uploadAudioToCloudStorage, deleteAudioFromCloudStorage } from '@/lib/cloud-storage';

// --- SCHEMAS (equivalent to old Zod schemas) ---

// UserProfile Schema (used in identifyLegalRisks, narrateRisk)
const UserProfileSchema = z.object({
  profession: z.string().optional(),
  languages: z.array(z.string()).optional(),
  city: z.string().optional(),
  legalKnowledge: z.string().optional(),
  education: z.string().optional(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

// RiskCard Schemas (used in identifyLegalRisks, narrateRisk)
const RiskCardSchema = z.object({
  risky_clause_text: z.string().describe('The exact quote from the document that represents a risk. If the risk is about something MISSING, quote the section where it should be.'),
  risk_type: z.enum(['Legal', 'Financial', 'Discrepancy']).describe("The category of the risk."),
  risk_origin: z.enum(['document', 'verbal_context', 'goal_congruence']).describe('The source of the identified risk.'),
  riskLevel: z.enum(['critical', 'moderate', 'low']).optional().describe('The severity of the risk.'),
  simplified_meaning: z.string().describe("A plain-language explanation of the clause and its risk, tailored to the user's legal knowledge."),
  suggested_fix: z.string().optional().describe('A suggestion for how to mitigate the risk.'),
});
const IdentifyLegalRisksOutputSchema = z.object({
  riskCards: z.array(RiskCardSchema).describe('A list of identified risks.'),
});
export type IdentifyLegalRisksOutput = z.infer<typeof IdentifyLegalRisksOutputSchema>;

// Verbal Context Schemas
const StatementSchema = z.object({
  speaker: z.string().describe("The identified speaker (e.g., 'Speaker 1', 'Speaker 2')."),
  statement: z.string().describe('A direct statement representing a promise, factual claim, or agreement made by the speaker.'),
});
const AnalyzeAudioOutputSchema = z.object({
  transcript: z.string().describe('The full transcript of the conversation.'),
  statements: z.array(StatementSchema).describe('A list of key statements, each attributed to a speaker.'),
});
export type AnalyzeAudioOutput = z.infer<typeof AnalyzeAudioOutputSchema>;


// --- VERTEX AI INITIALIZATION ---

function getGenerativeModel(
  outputSchema: z.ZodTypeAny,
  modelName: string = "gemini-2.5-pro",
  safetySettings?: any[]
) {
  const creds = process.env.GCLOUD_SERVICE_ACCOUNT_CREDS;
  if (!creds) {
    throw new Error('GCLOUD_SERVICE_ACCOUNT_CREDS environment variable is not set.');
  }
  
  if (creds.includes('...')) {
    throw new Error('Placeholder credentials found. Please replace the GCLOUD_SERVICE_ACCOUNT_CREDS in your .env file with your actual service account key.');
  }

  try {
    const credentials = JSON.parse(creds);
    
    const vertexAI = new VertexAI({
      project: process.env.GCLOUD_PROJECT || '',
      location: process.env.GCLOUD_LOCATION || '',
      googleAuthOptions: { credentials }
    });
    
    // Convert Zod schema to JSON schema
    const jsonSchema = zodToJsonSchema(outputSchema);
    // The API doesn't expect the '$schema' property, so we remove it.
    delete (jsonSchema as any).$schema;


    return vertexAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        // Pass the schema for structured response
        responseSchema: jsonSchema,
      },
       safetySettings: safetySettings || [ 
         {
           category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
           threshold: HarmBlockThreshold.BLOCK_NONE,
         },
         {
           category: HarmCategory.HARM_CATEGORY_HARASSMENT,
           threshold: HarmBlockThreshold.BLOCK_NONE,
         },
         {
           category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
           threshold: HarmBlockThreshold.BLOCK_NONE,
         },
         {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
         }
       ],
    });
  } catch (e: any) {
    throw new Error(`Failed to initialize Vertex AI: ${e.message}`);
  }
}

// Helper function to call the model with prompts and a schema for the output
async function generateStructuredContent<T extends z.ZodTypeAny>(
  promptParts: (string | {text: string} | {inlineData: {data: string, mimeType: string}})[],
  outputSchema: T,
  safetySettings?: any[],
): Promise<z.infer<T>> {
  // Pass the schema to the model initialization
  const generativeModel = getGenerativeModel(outputSchema, "gemini-2.5-pro", safetySettings);

  // For multimodal requests, all parts must be objects. Convert any string parts.
  const requestParts = promptParts.map(part => {
    if (typeof part === 'string') {
      return { text: part };
    }
    return part;
  });


  try {
    const result = await generativeModel.generateContent({contents: [{role: 'user', parts: requestParts}]});
    const modelResponse = result.response;

    if (!modelResponse.candidates?.[0]?.content?.parts?.[0]?.text) {
        if (modelResponse.promptFeedback?.blockReason) {
           throw new Error(`Request was blocked due to: ${modelResponse.promptFeedback.blockReason}`);
        }
        throw new Error('Received an empty or invalid response from the model.');
    }
    
    // The model now directly returns an object that should match the schema
    const structuredResponse = JSON.parse(modelResponse.candidates[0].content.parts[0].text);

    // Although the model is forced to use the schema, it's still good practice
    // to validate the output on our end before returning.
    const validationResult = outputSchema.safeParse(structuredResponse);

    if (!validationResult.success) {
      console.error("Zod validation failed:", validationResult.error.errors);
      throw new Error(`The model's response did not match the required schema.`);
    }

    return validationResult.data;
  } catch (error: any) {
    console.error("Error in generateStructuredContent:", error);
    // Re-throwing with a more user-friendly message
    const errorMessage = error.message.includes('permission') 
      ? "Permission denied. Please check your Vertex AI project permissions."
      : `Failed to generate content. ${error.message}`;
    throw new Error(errorMessage);
  }
}


// --- SERVER ACTIONS ---

// Action for document summarization
export async function summarizeLegalDocument(input: { documentText: string }): Promise<{ summary: string }> {
  const outputSchema = z.object({
    summary: z.string().describe('The concise, plain-language summary of the document.'),
  });

  const prompt = `You are an AI legal assistant. Generate a concise, plain-language summary of the following legal text based only on the information present. Focus on the primary obligations, key financial terms, and the document's main purpose. Do not add any outside information or legal interpretations not explicitly stated in the text.

Document:
${input.documentText}`;
  
  return generateStructuredContent([prompt], outputSchema);
}

// Action to analyze conversation audio (legacy - uses base64 data)
export async function transcribeAndAnalyzeAudio(input: { audioDataUri: string }): Promise<AnalyzeAudioOutput> {
  const prompt = `You are an expert in speaker diarization. Analyze this conversation audio. First, produce a full 'transcript' of the conversation. Then, from your transcript, extract the key 'statements' that represent promises, factual claims, or agreements. Your output must attribute each statement to the correct speaker.`;
  
  const mimeType = input.audioDataUri.split(';')[0].split(':')[1];
  const base64Data = input.audioDataUri.split(',')[1];
  
  const audioPart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };
  
  return generateStructuredContent([{ text: prompt }, audioPart], AnalyzeAudioOutputSchema);
}

// New action for direct cloud upload and analysis
export async function transcribeAndAnalyzeAudioFromCloud(input: { 
  audioBase64: string; 
  mimeType: string; 
  originalFileName: string 
}): Promise<AnalyzeAudioOutput & { gcsUri: string }> {
  const prompt = `You are an expert in speaker diarization. Analyze this conversation audio. First, produce a full 'transcript' of the conversation. Then, from your transcript, extract the key 'statements' that represent promises, factual claims, or agreements. Your output must attribute each statement to the correct speaker.`;
  
  let gcsUri: string = '';
  
  try {
    // Convert base64 string back to Buffer for cloud storage
    const audioBuffer = Buffer.from(input.audioBase64, 'base64');
    
    // Upload to Google Cloud Storage
    const uploadResult = await uploadAudioToCloudStorage(
      audioBuffer,
      input.mimeType,
      input.originalFileName
    );
    gcsUri = uploadResult.gcsUri;
    
    // Use the base64 data directly for Vertex AI
    const audioPart = {
      inlineData: {
        data: input.audioBase64,
        mimeType: input.mimeType,
      },
    };
    
    const result = await generateStructuredContent([{ text: prompt }, audioPart], AnalyzeAudioOutputSchema);
    
    return {
      ...result,
      gcsUri
    };
  } catch (error) {
    // Clean up uploaded file if analysis fails
    if (gcsUri) {
      await deleteAudioFromCloudStorage(gcsUri);
    }
    throw error;
  }
}


// Action to parse user goals
export async function parseUserGoals(input: { goalsText: string }): Promise<{ user_intentions: string[]; risks_to_avoid: string[] }> {
  const outputSchema = z.object({
    user_intentions: z.array(z.string()).describe('Specific intentions extracted from the user\'s goals.'),
    risks_to_avoid: z.array(z.string()).describe('Specific risks the user wants to avoid.'),
  });

  const prompt = `Analyze the user's stated goals. Extract specific intentions and risks they want to avoid.

User Goals:
${input.goalsText}`;

  return generateStructuredContent([prompt], outputSchema);
}

// Action for risk analysis
export type IdentifyLegalRisksInput = {
  documentText: string;
  userContext: UserProfile;
  verbalContext: { statements?: {speaker: string, statement: string}[] };
  userGoals: { user_intentions?: string[]; risks_to_avoid?: string[] };
};

export async function identifyLegalRisks(input: IdentifyLegalRisksInput): Promise<IdentifyLegalRisksOutput> {
  const prompt = `You are a hyper-vigilant AI legal and financial analyst. Your task is to perform a risk analysis of a legal document, grounding every finding in the provided context.

Source Document Text:
${input.documentText}

User Profile:
${JSON.stringify(input.userContext)}

Verbal Context (Statements made during negotiation):
${JSON.stringify(input.verbalContext.statements)}

User Goals:
${JSON.stringify(input.userGoals)}

Your Task:
1.  **Analyze for Discrepancies (Highest Priority)**: First, you MUST compare the Source Document against the Verbal Context and User Goals.
    *   If a verbal promise is **CONTRADICTED** or **MISSING** from the document, you MUST create a risk card. Set its \`risk_origin\` to \`verbal_context\`, \`risk_type\` to \`Discrepancy\`, and \`riskLevel\` to \`critical\`.
    *   If a user goal is **CONTRADICTED** or **MISSING** from the document, you MUST create a risk card. Set its \`risk_origin\` to \`goal_congruence\`, \`risk_type\` to \`Discrepancy\`, and \`riskLevel\` to \`critical\`.
2.  **Analyze for Standard Risks**: Second, analyze the Source Document on its own for standard legal or financial risks. For these risks, you MUST set the \`risk_origin\` to \`document\`. Assess the \`riskLevel\` as critical, moderate, or low.
3.  **Personalize Explanations**: For every risk identified, you MUST tailor the \`simplified_meaning\` field based on the user's \`legalKnowledge\`. If their knowledge is 'None' or 'Basic', use extremely simple, non-legal terms. If it is 'Advanced' or 'Expert', you can be more technical.
4.  **Generate Structured Output**: Provide your complete analysis as a single list of risk cards, following all instructions above.`;

  return generateStructuredContent([prompt], IdentifyLegalRisksOutputSchema);
}

// Action for narrating a risk
export type NarrateRiskInput = {
  risk: z.infer<typeof RiskCardSchema>;
  userProfile: UserProfile;
  language?: string;
};

export async function narrateRisk(input: NarrateRiskInput): Promise<{ narrative: string }> {
  const outputSchema = z.object({
    narrative: z.string().describe('A short, plausible story illustrating the risk.'),
  });

  const languageInstruction = input.language ? ` in ${input.language}` : '';

  const prompt = `You are a storyteller. Write a short, plausible future scenario (under 150 words)${languageInstruction} that illustrates how the following risk could realistically impact the user. The story must be a direct and logical consequence of the specific risk. **Crucially, you MUST use the user's profile (profession, city) to make the story feel personal and relatable.**

Risk:
${JSON.stringify(input.risk)}

User Profile:
${JSON.stringify(input.userProfile)}`;

  return generateStructuredContent([prompt], outputSchema);
}

// Action for the RAG bot
export async function askQuery(input: { question: string; documentText: string }): Promise<{ answer: string }> {
  const outputSchema = z.object({
    answer: z.string().describe('The answer to the question, based only on the document.'),
  });

  const prompt = `You are a helpful AI assistant. Answer the user's question based ONLY on the content of the document provided below. Do not use any outside information. If the answer is not in the document, state that clearly.

Document:
${input.documentText}

Question:
${input.question}`;

  const relaxedSafetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
     {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    }
  ];

  return generateStructuredContent([prompt], outputSchema, relaxedSafetySettings);
}
