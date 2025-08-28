export declare function transcribeAudioToText(audioBuffer: Buffer, mimeType: string): Promise<string>;
export declare function detectMoodFromTextPortuguese(transcript: string): Promise<'alegre' | 'neutral' | 'triste' | 'irritado' | 'ansioso'>;
export declare function answerQuestionPortuguese(transcript: string, mood: string): Promise<string>;
export declare function synthesizeSpeechPortuguese(text: string, mood: string): Promise<{
    audioBuffer: Buffer;
    mimeType: string;
}>;
//# sourceMappingURL=openai.d.ts.map