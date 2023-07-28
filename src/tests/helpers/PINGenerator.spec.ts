import { PINDictionary } from '../../helpers/types.js';
import PINGenerator from '../../helpers/PINGenerator';

describe('PIN Generation Tests', () => {
    let gen: PINGenerator;
    beforeAll(() => {
        gen = new PINGenerator();
    });

    test('Batch create 2 pins', async () => {
        const output: PINDictionary = await gen.initialCreate(2);
        expect(Object.keys(output).length).toBe(2); // there should be 2 pins
        expect(Object.keys(output)[0]).not.toEqual(Object.keys(output)[1]); // pins should be unique
    });

    test('Batch create 100,000 pins (test correct number of outputs)', async () => {
        const output: PINDictionary = await gen.initialCreate(100000);
        expect(Object.keys(output).length).toBe(100000); // there should be 100,000 pins
    });

    test(`Batch create attempt repeated PIN`, async () => {
        // Note: this won't guarantee a repeat but it's likely, only 4 possibilities
        // Attempting to force a repeat by making the # of PINs greater than the number of possibilities
        // will result in an error instead
        const output: PINDictionary = await gen.initialCreate(4, 2, 'AB');
        expect(Object.keys(output).length).toBe(4); // there should be 4 pins, despite possible repeats during the creation process
        const outputSet = new Set(Object.keys(output));
        expect(outputSet.size).toBe(4); // there should be 4 unique values in the set
    });

    test('Batch create 0 pins', async () => {
        await expect(gen.initialCreate(0)).rejects.toThrow(
            'The number of PINS created must be greater than 0.',
        );
    });

    test('Batch create force repeated PIN', async () => {
        await expect(gen.initialCreate(9, 3, 'AB')).rejects.toThrow(
            'Quantity of PINs requested too high: guaranteed repeats for the given pin length and character set.',
        );
    });

    test('Batch create too short PIN (length < 1)', async () => {
        await expect(gen.initialCreate(1, 0)).rejects.toThrow(
            'PIN must be of length 1 or greater',
        );
    });

    test('Batch create PIN with no characters in set', async () => {
        await expect(gen.initialCreate(1, 2, '')).rejects.toThrow(
            'Quantity of PINs requested too high: guaranteed repeats for the given pin length and character set.',
        );
    });
});
