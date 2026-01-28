import crypto from 'crypto';

const CLASS_NAME = 'HashingService';
const logError = (funcName, message, error) => {
    console.error(`[${funcName} Error] ${message}:`, error?.message || error);
};

/**
 * @class HashingService
 * @description Provides methods for generating and verifying hashes for blockchain-related operations.
 */
export class HashingService {
    /**
     * @function generateHash
     * @description Generates a SHA-256 HMAC hash for the given body using the specified secret key.
     * @param {Object} querier - An object responsible for handling queries (not utilized in this method).
     * @param {Object} body - The data to be hashed, which will be stringified before hashing.
     * @param {string} secretKey - The secret key used for HMAC generation.
     * @returns {string} The generated hash as a hexadecimal string.
     */
    static async generateHash(querier, body, secretKey) {
        const funcName = `${CLASS_NAME}.generateHash`;
        try {
            return crypto
                .createHmac('sha256', secretKey)
                .update(JSON.stringify(body))
                .digest('hex');
        } catch (error) {
            logError(funcName, 'Failed to generate hash', error);
        }
    }
}
