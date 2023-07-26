import { PIN, PINDictionary } from './types.js';
import cryptoRandomString from 'crypto-random-string';

export default class PINGenerator {
    allowedChars: string = '0123456789abcdefghijklmnopqrstuvwxyz';
    pinLength: number = 8;

    /**
     * Creates a single PIN, checking against the database to ensure it is unique
     * This requires DB approval, so it cannot be finalized at the moment
     */
    /* public create(): PIN {

    } */

    /**
     * Creates a batch of PINS on first use, checking amongst themselves and not a database for uniqueness
     * @param quantity (required) is the number of PINS to create
     * @param pinLength is the length of the pin. Defaults to 8
     * @param allowedChars is a string containing the allowed character set (not a regex). Default is a-z and 0-9
     */
    public async initialCreate(
        quantity: number,
        pinLength?: number,
        allowedChars?: string,
    ): Promise<PINDictionary> {
        if (quantity <= 0) {
            throw new RangeError(
                'The number of PINS created must be greater than 0.',
            );
        }
        const length: number =
            pinLength || pinLength === 0 ? pinLength : this.pinLength;
        const characters: string =
            allowedChars || allowedChars === ''
                ? allowedChars
                : this.allowedChars;
        if (length <= 0) {
            throw new RangeError('PIN must be of length 1 or greater');
        }
        if (Math.pow(characters.length, length) < quantity) {
            // characters^length < quantity (of pins)
            throw new RangeError(
                'Quantity of PINs requested too high: guaranteed repeats for the given pin length and character set.',
            );
        }
        const PINDictionary: PINDictionary = {};
        for (let i: number = 0; i < quantity; i += 1) {
            const newPIN: PIN = cryptoRandomString({
                length: length,
                characters: characters,
            });
            if (PINDictionary[newPIN]) {
                // pin already exists
                i -= 1;
                continue; // try again
            } else {
                PINDictionary[newPIN] = 1; // add PIN to object / dictionary
            }
        }
        return PINDictionary;
    }
}
