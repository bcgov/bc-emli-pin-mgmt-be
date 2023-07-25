import { PIN, PINDictionary } from './types';

export default class PINGenerator {
    allowedChars: string = '0123456789abcdefghijklmnopqrstuvwxyz';
    pinLength: number = 8;

    /**
     * Creates a single PIN, checking against the database to ensure it is unique
     */
    /* public create(): PIN {

    } */

    /**
     * Creates a batch of PINS on first use, checking amongst themselves and not a database for uniqueness
     * @param quantity is the number of PINS to create
     */
    public async initialCreate(quantity: number): Promise<PINDictionary> {
        if (quantity <= 0) {
            throw new RangeError(
                'The number of PINS created must be greater than 0.',
            );
        }
        const crs = await import('crypto-random-string');
        const PINDictionary: PINDictionary = {};
        for (let i: number = 0; i < quantity; i += 1) {
            const newPIN: PIN = crs.default({
                length: this.pinLength,
                characters: this.allowedChars,
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
