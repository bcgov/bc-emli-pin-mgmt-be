import { PIN, PINDictionary, createdPIN } from './types';
import { findPin } from '../db/ActivePIN.db';
import cryptoRandomString from 'crypto-random-string';

export default class PINGenerator {
    allowedCharsUpper: string = '123456789ABCDEFGHIJKLMNPQRSTUVWXYZ';
    allowedCharsLower: string = '0123456789abcdefghijklmnopqrstuvwxyz';
    allowedChars: string = this.allowedCharsUpper;
    pinLength: number = 8;

    /**
     * Creates a single PIN, checking against the database to ensure it is unique.
     * @param pinLength is the length of the pin. Defaults to 8
     * @param allowedChars is a string containing the allowed character set (not a regex). Default is A-Z excluding O, and 1-9
     */
    public async create(
        pinLength?: number,
        allowedChars?: string,
    ): Promise<createdPIN> {
        const length: number =
            pinLength || pinLength === 0 ? pinLength : this.pinLength;
        const characters: string = allowedChars
            ? allowedChars
            : this.allowedChars;
        if (length <= 0) {
            throw new RangeError('PIN must be of length 1 or greater');
        }
        let newPIN: PIN = '';
        let retry: number = 0;
        for (; retry < 20; retry++) {
            newPIN = cryptoRandomString({
                length: length,
                characters: characters,
            });
            const DBResult = await findPin({ pin: true }, { pin: newPIN });
            // Check against DB here
            if (DBResult.length >= 1) {
                continue;
            } else {
                break;
            }
        }
        if (retry >= 20) {
            // we couldn't make a unique pin after 20 attempts, likely would continue into an infinite loop
            throw new RangeError(
                'Too many PIN creation attempts: consider expanding your pin length or character set to allow more unique PINs.',
            );
        }
        // Else, return new PIN for later insertion into the database
        return { pin: newPIN };
    }

    /**
     * Creates a batch of PINS on first use, checking amongst themselves and not a database for uniqueness
     * @param quantity (required) is the number of PINS to create
     * @param pinLength is the length of the pin. Defaults to 8
     * @param allowedChars is a string containing the allowed character set (not a regex). Default is A-Z excluding O, and 1-9
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
        const characters: string = allowedChars
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
        return this.createPINDictionary(length, characters, quantity, false);
    }

    /*
	 Seperated to allow for full jest coverage (with escape function)
	 Otherwise, we cannot guarantee we will end up 
	*/
    private createPINDictionary(
        length: number,
        characters: string,
        quantity: number,
        escape?: boolean,
    ): PINDictionary {
        const PINDictionary: PINDictionary = {};
        let escapeCount = 0;
        for (let i: number = 0; i < quantity; i += 1) {
            if (escape === true && escapeCount >= quantity)
                return PINDictionary;
            const newPIN: PIN = cryptoRandomString({
                length: length,
                characters: characters,
            });
            if (PINDictionary[newPIN]) {
                // pin already exists
                i -= 1;
                escapeCount += 1;
                continue; // try again
            } else {
                PINDictionary[newPIN] = 1; // add PIN to object / dictionary
            }
        }
        return PINDictionary;
    }
}
