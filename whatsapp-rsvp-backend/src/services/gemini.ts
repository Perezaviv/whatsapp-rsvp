
import { GoogleGenAI, Type } from "@google/genai";
import { RsvpStatus, ProcessedResponse } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    status: {
      type: Type.STRING,
      enum: [RsvpStatus.CONFIRMED, RsvpStatus.DECLINED, RsvpStatus.NEEDS_ATTENTION],
      description: 'The determined RSVP status.'
    },
    attendeesCount: {
      type: Type.INTEGER,
      description: 'The number of people attending. Should be 0 if the status is DECLINED or NEEDS_ATTENTION. Should be at least 1 if CONFIRMED.'
    }
  },
  required: ['status', 'attendeesCount']
};

export const processResponseWithGemini = async (message: string): Promise<ProcessedResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following RSVP message and extract the status and number of attendees. The user is replying to an event invitation.
      - If they confirm, status is CONFIRMED.
      - If they decline, status is DECLINED.
      - If they are unsure or the intent is unclear, status is NEEDS_ATTENTION.
      - Attendee count must be 0 for any status other than CONFIRMED.
      - If they say just "yes" or "confirmed", assume 1 attendee.
      - If they say they are coming and mention a number, use that number.
      - The user is replying in Hebrew.
      Message: "${message}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    
    // Robustly find the JSON object within the string, ignoring markdown wrappers or other text.
    const startIndex = jsonText.indexOf('{');
    const endIndex = jsonText.lastIndexOf('}');
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
        console.error("Could not find a valid JSON object in Gemini response:", jsonText);
        throw new Error("No valid JSON object found in response");
    }
    const jsonSubstring = jsonText.substring(startIndex, endIndex + 1);

    const parsedJson = JSON.parse(jsonSubstring) as ProcessedResponse;

    if (Object.values(RsvpStatus).includes(parsedJson.status) && typeof parsedJson.attendeesCount === 'number') {
        if (parsedJson.status !== RsvpStatus.CONFIRMED) {
            parsedJson.attendeesCount = 0;
        }
        if (parsedJson.status === RsvpStatus.CONFIRMED && parsedJson.attendeesCount < 1) {
            parsedJson.attendeesCount = 1;
        }
        return parsedJson;
    } else {
        console.error("Invalid JSON structure from Gemini", parsedJson);
        throw new Error("Invalid JSON structure from Gemini");
    }

  } catch (error) {
    console.error("Error processing response with Gemini:", error);
    // Fallback to NEEDS_ATTENTION status on error, so it can be manually reviewed.
    return { status: RsvpStatus.NEEDS_ATTENTION, attendeesCount: 0 };
  }
};
