export interface WhatsAppMediaInfo {
    id: string;
    mimeType: string;
}
export declare function getMediaUrl(mediaId: string, accessToken: string): Promise<string>;
export declare function downloadBinary(url: string, accessToken: string): Promise<Buffer>;
export declare function sendAudioMessage(phoneNumberId: string, to: string, mediaId: string, accessToken: string): Promise<void>;
export declare function uploadAudio(phoneNumberId: string, audioBuffer: Buffer, mimeType: string, accessToken: string): Promise<string>;
//# sourceMappingURL=whatsapp.d.ts.map