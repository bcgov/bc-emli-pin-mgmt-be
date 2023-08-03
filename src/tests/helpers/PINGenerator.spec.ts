import * as ActivePIN from '../../db/ActivePIN.db';
import PINGenerator from '../../helpers/PINGenerator';
import { DataSource, EntityMetadata } from 'typeorm';

// mock out db
import { ActivePin } from '../../entity/ActivePin';
import { PINDictionary } from '../../helpers/types';

jest.spyOn(ActivePIN, 'findPin').mockImplementation(
    async (select?: object | undefined, where?: object | undefined) => {
        const result = [{ pin: 'A' }];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((where as any).pin === 'A') return result as ActivePin[];
        return [];
    },
);

jest.spyOn(DataSource.prototype, 'getMetadata').mockImplementation(
    () => ({}) as EntityMetadata,
);

describe('test new function', () => {
    let gen: PINGenerator;
    beforeAll(() => {
        gen = new PINGenerator();
    });
    /*
		Singular create tests
	*/
    test('Initial create 1 pin (empty database)', async () => {
        const newPIN = await gen.create();
        expect(newPIN.pin.length).toEqual(8);
        const dbPINs = await ActivePIN.findPin(undefined, { pin: newPIN.pin });
        expect(dbPINs.length).toEqual(0); // count of matching pins should be 0
    });

    test('Initial create 1 pin of different length', async () => {
        const newPIN = await gen.create(9);
        expect(newPIN.pin.length).toEqual(9);
    });

    test('Initial create 1 pin of different character set', async () => {
        const newPIN = await gen.create(2, 'B');
        expect(newPIN.pin.length).toEqual(2);
        expect(newPIN.pin).toEqual('BB');
    });

    test('Initial create too short pin (length < 1)', async () => {
        await expect(gen.create(0)).rejects.toThrow(
            'PIN must be of length 1 or greater',
        );
    });

    test('Initial create guaranteed repeat PIN', async () => {
        const dbPINs = await ActivePIN.findPin(undefined, { pin: 'A' });
        expect(dbPINs.length).toBe(1); // the pin should be saved as part of the mock
        await expect(gen.create(1, 'A')).rejects.toThrow(
            'Too many PIN creation attempts: consider expanding your pin length or character set to allow more unique PINs.',
        );
    });

    /*
		Initial creation (batch) tests
	*/
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
        const output: PINDictionary = await gen.initialCreate(1, 2, '');
        expect(Object.keys(output).length).toBe(1);
        expect(Object.keys(output)[0].length).toBe(2);
    });
});
