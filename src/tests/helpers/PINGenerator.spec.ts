import { PINDictionary } from '../../helpers/types';
import PINGenerator from '../../helpers/PINGenerator';
import { AppDataSource } from '../../data-source';
import { ActivePin } from '../../entity/ActivePin';
import { Repository } from 'typeorm';

describe('PIN Generation Tests', () => {
    let gen: PINGenerator;
    let PINRepo: Repository<ActivePin>;
    beforeAll(async () => {
        gen = new PINGenerator();
        await AppDataSource.initialize();
        PINRepo = AppDataSource.getRepository(ActivePin);
    });

    /*
		Singular create tests
	*/
    test('Initial create 1 pin (empty database)', async () => {
        const newPIN = await gen.create();
        expect(newPIN.pin.length).toEqual(8);
        const dbPINs = await PINRepo.findAndCount({
            where: { pin: newPIN.pin },
        });
        expect(dbPINs[1]).toEqual(0); // count of matching pins should be 0
    });

    test('Initial create 1 pin of different length', async () => {
        const newPIN = await gen.create(9);
        expect(newPIN.pin.length).toEqual(9);
    });

    test('Initial create 1 pin of different character set', async () => {
        const newPIN = await gen.create(2, 'A');
        expect(newPIN.pin.length).toEqual(2);
        expect(newPIN.pin).toEqual('AA');
    });

    test('Initial create too short pin (length < 1)', async () => {
        await expect(gen.create(0)).rejects.toThrow(
            'PIN must be of length 1 or greater',
        );
    });

    test('Initial create guaranteed repeat PIN', async () => {
        const insertPIN = new ActivePin();
        insertPIN.pin = 'A';
        insertPIN.addressLine_1 = '123 main st';
        insertPIN.pid = 1234;
        insertPIN.parcelStatus = 'A';
        insertPIN.titleNumber = 'abcd123';
        insertPIN.landTitleDistrict = 'bc';
        insertPIN.titleStatus = 'R';
        insertPIN.city = 'Vancouver';
        insertPIN.country = 'Canada';
        await AppDataSource.manager.save(insertPIN);
        const dbPINs = await PINRepo.find({ where: { pin: 'A' } });
        expect(dbPINs.length).toBe(1); // the pin should be saved
        await expect(gen.create(1, 'A')).rejects.toThrow(
            'Too many PIN creation attempts: consider expanding your pin length or character set to allow more unique PINs.',
        );
        // Cleanup: remove added pin from db
        await PINRepo.remove(dbPINs[0]);
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
        await expect(gen.initialCreate(1, 2, '')).rejects.toThrow(
            'Quantity of PINs requested too high: guaranteed repeats for the given pin length and character set.',
        );
    });

    afterAll(async () => {
        await PINRepo.clear(); // delete any remaining data
        await AppDataSource.destroy();
    });
});
