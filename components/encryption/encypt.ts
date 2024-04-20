import crypto from 'crypto';

// Encryption function
export function encryptData(data: string | null): string {
    if (data === null) {
        throw new Error('Cannot encrypt null data');
    }
    const key = process.env.ENCRYPTION_KEYS ?? '';
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encryptedData = cipher.update(data, 'utf-8', 'hex');
    encryptedData += cipher.final('hex');
    return encryptedData;
}

// Decryption function// Decryption function
export function decryptData(encryptedData: string): string {
    if (!encryptedData) {
        throw new Error("Encrypted data is undefined");
    }

    const key = process.env.ENCRYPTION_KEYS ?? '';
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decryptedData = decipher.update(encryptedData, 'hex', 'utf-8');
    decryptedData += decipher.final('utf-8');
    return decryptedData;
}
