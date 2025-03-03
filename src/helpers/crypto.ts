import crypto, { CipherKey } from 'crypto';
require('dotenv/config');

const SECRET_KEY: CipherKey = Buffer.from(
    process.env.VALIDATION_KEY as string,
    'base64',
);
const IV_LENGTH = 12; // AES-GCM standard IV size

export function encryptJson(data: object): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', SECRET_KEY, iv);

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Get authTag for AES-GCM
    const authTag = cipher.getAuthTag();

    // Create a full JSON object
    const payload = JSON.stringify({
        iv: iv.toString('base64'),
        encryptedData: encrypted,
        authTag: authTag.toString('base64'),
    });

    // Encode the entire JSON object as Base64 (prevents + and / issues)
    return Buffer.from(payload, 'utf8').toString('base64');
}

export function decryptJson(encryptedString: string): object {
    const { iv, encryptedData, authTag } = JSON.parse(encryptedString);

    const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        SECRET_KEY,
        Buffer.from(iv, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));

    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
}
