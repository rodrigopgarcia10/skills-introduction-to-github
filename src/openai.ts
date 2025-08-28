import OpenAI from 'openai';
import { toFile } from 'openai/uploads';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function transcribeAudioToText(audioBuffer: Buffer, mimeType: string): Promise<string> {
  const file = await toFile(audioBuffer, 'audio.ogg');
  const response = await client.audio.transcriptions.create({
    file,
    model: 'gpt-4o-transcribe',
  });
  // @ts-ignore: SDK types may vary
  return response.text as string;
}

export async function detectMoodFromTextPortuguese(transcript: string): Promise<'alegre' | 'neutral' | 'triste' | 'irritado' | 'ansioso'> {
  const system = `Você é um classificador de humor. Responda APENAS com uma palavra dentre: alegre, neutral, triste, irritado, ansioso.`;
  const user = `Transcrição: "${transcript}"\nQual é o humor predominante?`;
  const chat = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0,
  });
  const text = chat.choices[0].message.content?.trim().toLowerCase() || 'neutral';
  const allowed = ['alegre', 'neutral', 'triste', 'irritado', 'ansioso'] as const;
  return (allowed.includes(text as any) ? (text as any) : 'neutral');
}

export async function answerQuestionPortuguese(transcript: string, mood: string): Promise<string> {
  const system = `Você é um assistente de consulta por voz em Português. Adapte o tom ao humor do usuário (${mood}). Respostas breves, úteis e empáticas.`;
  const user = `Pergunta do usuário (transcrição): ${transcript}`;
  const chat = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.6,
  });
  return chat.choices[0].message.content || '';
}

export async function synthesizeSpeechPortuguese(text: string, mood: string): Promise<{ audioBuffer: Buffer; mimeType: string } > {
  // Use TTS - OpenAI audio.speech
  // Map mood to voice/profile
  const voice = mood === 'alegre' ? 'alloy' : mood === 'triste' ? 'verse' : mood === 'irritado' ? 'rush' : mood === 'ansioso' ? 'breeze' : 'alloy';
  const result = await client.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice,
    input: text,
    // speed: mood === 'triste' ? 0.9 : mood === 'irritado' ? 1.1 : 1.0,
    // emotion: mood
  });
  const arrayBuffer = await result.arrayBuffer();
  return { audioBuffer: Buffer.from(arrayBuffer), mimeType: 'audio/mpeg' };
}

