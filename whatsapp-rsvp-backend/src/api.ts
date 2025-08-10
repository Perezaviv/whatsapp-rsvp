
import express from 'express';
import { getAllGuests, sendRsvpMessage, handleWhatsAppWebhook, simulateReply } from './controllers/guestController';

const router = express.Router();

// Get all guests
router.get('/guests', getAllGuests);

// Send an RSVP invitation to a specific guest
router.post('/guests/:guestId/send', sendRsvpMessage);

// Simulate a reply from a guest (for testing from the dashboard)
router.post('/guests/:guestId/simulate-reply', simulateReply);

// WhatsApp Webhook endpoint - for REAL incoming messages
// Verification endpoint
router.get('/whatsapp-webhook', handleWhatsAppWebhook);
// Message handling endpoint
router.post('/whatsapp-webhook', handleWhatsAppWebhook);


export default router;