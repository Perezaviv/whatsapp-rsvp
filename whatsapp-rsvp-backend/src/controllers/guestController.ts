
import type { Request, Response } from 'express';
import { prisma } from '../services/db';
import { sendMessage } from '../services/whatsapp';
import { RsvpStatus, ProcessedResponse } from '../types';

// Helper function to process replies without AI
const processManualReply = (message: string): ProcessedResponse => {
    const trimmedMessage = message.trim();
    // Use a regex to ensure it's purely digits, then parse
    if (/^\d+$/.test(trimmedMessage)) {
        const num = parseInt(trimmedMessage, 10);
        if (num > 0) {
            return { status: RsvpStatus.CONFIRMED, attendeesCount: num };
        } else { // Handles 0
            return { status: RsvpStatus.DECLINED, attendeesCount: 0 };
        }
    } else {
        // Any non-numeric text needs manual attention
        return { status: RsvpStatus.NEEDS_ATTENTION, attendeesCount: null };
    }
};

// Get all guests from the database
export const getAllGuests = async (req: Request, res: Response) => {
  try {
    const guests = await prisma.guest.findMany({
      orderBy: { createdAt: 'asc' }
    });
    res.json(guests);
  } catch (error) {
    console.error('Failed to get guests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Send an invitation message
export const sendRsvpMessage = async (req: Request<{ guestId: string }>, res: Response) => {
    const { guestId } = req.params;
    try {
        const guest = await prisma.guest.findUnique({ where: { id: guestId } });
        if (!guest) {
            return res.status(404).json({ error: 'Guest not found' });
        }
        
        const message = `Hello ${guest.name}, you are invited to our event! Please reply to RSVP.`;
        await sendMessage(guest.phone, message);
        
        const updatedGuest = await prisma.guest.update({
            where: { id: guestId },
            data: { status: RsvpStatus.SENT, lastUpdate: new Date().toISOString() }
        });

        res.json(updatedGuest);
    } catch (error) {
        console.error(`Failed to send message to guest ${guestId}:`, error);
        await prisma.guest.update({
            where: { id: guestId },
            data: { status: RsvpStatus.FAILED, lastUpdate: new Date().toISOString() }
        });
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// Simulate a reply for testing purposes from the frontend
export const simulateReply = async (req: Request<{ guestId: string }, any, { message: string }>, res: Response) => {
    const { guestId } = req.params;
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const guest = await prisma.guest.findUnique({ where: { id: guestId } });
        if (!guest) {
            return res.status(404).json({ error: 'Guest not found' });
        }

        const processed = processManualReply(message);

        const updatedGuest = await prisma.guest.update({
            where: { id: guestId },
            data: {
                status: processed.status,
                attendeesCount: processed.attendeesCount,
                responseMessage: message,
                lastUpdate: new Date().toISOString(),
            }
        });
        res.json(updatedGuest);

    } catch (error) {
        console.error(`Failed to process simulated reply for guest ${guestId}:`, error);
        res.status(500).json({ error: 'Failed to process reply' });
    }
};


// Handle REAL incoming webhooks from WhatsApp
export const handleWhatsAppWebhook = async (req: Request, res: Response) => {
    // Handle verification challenge from Meta
    if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
            console.log('Webhook verified!');
            return res.status(200).send(challenge as string);
        } else {
            console.error('Webhook verification failed.');
            return res.sendStatus(403);
        }
    }
    
    // Handle incoming message notifications
    if (req.method === 'POST') {
        const body = req.body;

        try {
            // Check if it's a message notification
            if (body.object === 'whatsapp_business_account' && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
                const messageData = body.entry[0].changes[0].value.messages[0];
                const from = messageData.from; // User's phone number
                const messageText = messageData.text?.body;

                if (!messageText) {
                    console.log('Received a non-text message, ignoring.');
                    return res.sendStatus(200);
                }

                // Find the guest by phone number
                const guest = await prisma.guest.findUnique({ where: { phone: from } });
                if (!guest) {
                    console.log(`Received message from unknown number: ${from}`);
                    return res.sendStatus(200); // Important to send 200 to avoid WhatsApp retries
                }

                const processed = processManualReply(messageText);

                // Update guest in the database
                await prisma.guest.update({
                    where: { id: guest.id },
                    data: {
                        status: processed.status,
                        attendeesCount: processed.attendeesCount,
                        responseMessage: messageText,
                        lastUpdate: new Date().toISOString(),
                    }
                });
                
                console.log(`Processed reply from ${from}: ${messageText}`);
            }
            // Acknowledge receipt of the event
            return res.sendStatus(200);

        } catch (error) {
            console.error('Error processing webhook:', error);
            return res.sendStatus(500);
        }
    }

    // Fallback for other methods
    return res.sendStatus(405);
};
