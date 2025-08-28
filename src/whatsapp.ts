import axios from 'axios';

export interface WhatsAppMediaInfo {
  id: string;
  mimeType: string;
}

export async function getMediaUrl(mediaId: string, accessToken: string): Promise<string> {
  const url = `https://graph.facebook.com/v21.0/${mediaId}`;
  const { data } = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.url as string;
}

export async function downloadBinary(url: string, accessToken: string): Promise<Buffer> {
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    responseType: 'arraybuffer',
  });
  return Buffer.from(response.data);
}

export async function sendAudioMessage(
  phoneNumberId: string,
  to: string,
  mediaId: string,
  accessToken: string,
): Promise<void> {
  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  await axios.post(
    url,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'audio',
      audio: { id: mediaId },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );
}

export async function uploadAudio(
  phoneNumberId: string,
  audioBuffer: Buffer,
  mimeType: string,
  accessToken: string,
): Promise<string> {
  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/media`;
  const form = new (await import('form-data')).default();
  form.append('messaging_product', 'whatsapp');
  form.append('type', mimeType);
  form.append('file', audioBuffer, { filename: 'reply.ogg', contentType: mimeType });

  const { data } = await axios.post(url, form, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...form.getHeaders(),
    },
  });
  return data.id as string;
}

