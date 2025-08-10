
import { Guest } from '../types';

const API_BASE_URL = '/api'; // Vite proxy will handle this in development

const handleResponse = async (response: Response) => {
    if (response.ok) {
        // Handle successful responses.
        // A 204 No Content response has no body, so calling .json() would error.
        if (response.status === 204) {
            return null;
        }
        return response.json();
    }

    // Handle error responses.
    let errorMessage;
    try {
        // The backend should send a JSON object with an error message.
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `Request failed with status ${response.status}`;
    } catch (e) {
        // If parsing fails, the error response was not JSON (e.g., HTML from a proxy or server crash).
        console.error("Failed to parse error response from server as JSON.", e);
        errorMessage = `Request failed: ${response.status} ${response.statusText}. The server returned a non-JSON response.`;
    }
    throw new Error(errorMessage);
};

export const api = {
    getGuests: async (): Promise<Guest[]> => {
        const response = await fetch(`${API_BASE_URL}/guests`);
        return handleResponse(response);
    },

    sendMessage: async (guestId: string): Promise<Guest> => {
        const response = await fetch(`${API_BASE_URL}/guests/${guestId}/send`, {
            method: 'POST',
        });
        return handleResponse(response);
    },

    simulateReply: async (guestId: string, message: string): Promise<Guest> => {
        const response = await fetch(`${API_BASE_URL}/guests/${guestId}/simulate-reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });
        return handleResponse(response);
    },
};
