import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { getMediaUrl, downloadBinary, uploadAudio, sendAudioMessage } from './whatsapp.js';
import { transcribeAudioToText, detectMoodFromTextPortuguese, answerQuestionPortuguese, synthesizeSpeechPortuguese } from './openai.js';
const app = express();
app.use(express.json({ limit: '10mb' }));
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || '';
// GET verification for WhatsApp webhook
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
});
// POST webhook to receive messages
app.post('/webhook', (req, res) => {
    // Acknowledge receipt immediately to avoid retries
    res.sendStatus(200);
    // Ingest the notification asynchronously
    const body = req.body;
    if (!body || body.object !== 'whatsapp_business_account') {
        return;
    }
    try {
        const entries = body.entry || [];
        for (const entry of entries) {
            const changes = entry.changes || [];
            for (const change of changes) {
                const value = change.value || {};
                const messages = value.messages || [];
                for (const message of messages) {
                    const from = message.from;
                    const type = message.type;
                    console.log(`[webhook] incoming message type=${type} from=${from}`);
                    if (type === 'audio' && message.audio?.id) {
                        void handleIncomingAudioMessage({
                            from,
                            mediaId: message.audio.id,
                            mimeType: message.audio.mime_type,
                            businessPhoneId: value.metadata?.phone_number_id,
                        });
                    }
                }
            }
        }
    }
    catch (error) {
        console.error('Webhook handling error', error);
    }
});
app.get('/', (_req, res) => {
    res.send('WhatsApp Audio Assistant is running');
});
app.listen(PORT, () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
async function handleIncomingAudioMessage(params) {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    if (!accessToken) {
        console.error('Missing WHATSAPP_ACCESS_TOKEN');
        return;
    }
    try {
        const mediaUrl = await getMediaUrl(params.mediaId, accessToken);
        const audioBuffer = await downloadBinary(mediaUrl, accessToken);
        console.log(`Downloaded audio bytes=${audioBuffer.length}`);
        const mimeType = params.mimeType || 'audio/ogg';
        const transcript = await transcribeAudioToText(audioBuffer, mimeType);
        console.log('Transcript:', transcript);
        const mood = await detectMoodFromTextPortuguese(transcript);
        console.log('Detected mood:', mood);
        const answer = await answerQuestionPortuguese(transcript, mood);
        console.log('Answer:', answer);
        const tts = await synthesizeSpeechPortuguese(answer, mood);
        const newMediaId = await uploadAudio(params.businessPhoneId, tts.audioBuffer, tts.mimeType, accessToken);
        await sendAudioMessage(params.businessPhoneId, params.from, newMediaId, accessToken);
        console.log('Replied with synthesized audio');
    }
    catch (err) {
        console.error('Error processing audio message', err);
    }
}
//# sourceMappingURL=server.js.map