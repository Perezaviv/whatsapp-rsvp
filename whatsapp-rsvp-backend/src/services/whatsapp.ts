
import axios from 'axios';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WhatsApp environment variables are not set.');
}

const whatsappAPI = axios.create({
    baseURL: `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}`,
    headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

export const sendMessage = async (to: string, message: string) => {
    try {
        const response = await whatsappAPI.post('/messages', {
            messaging_product: 'whatsapp',
            to: to,
            type: 'text',
            text: {
                body: message
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('Error sending WhatsApp message:', error.response?.data || error.message);
        throw new Error('Failed to send WhatsApp message.');
    }
};
