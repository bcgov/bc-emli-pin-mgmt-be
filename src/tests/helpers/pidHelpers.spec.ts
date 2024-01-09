import { ActivePin } from '../../entity/ActivePin';
import {
    pidStringSort,
    pidStringSplitAndSort,
    sortActivePinResults,
} from '../../helpers/pidHelpers';

describe('pidHelpers tests', () => {
    test('pidStringSplitAndSort returns an array of size 1 if there is a single valid input of type string', () => {
        const res = pidStringSplitAndSort('8');
        expect(res.length).toBe(1);
        expect(res[0]).toBe('8');
    });

    test('pidStringSplitAndSort returns a sorted string array if there are multiple valid inputs in the string', () => {
        const res = pidStringSplitAndSort('9|10|8');
        expect(Array.isArray(res)).toBe(true); // this is how js behaves with arrays
        if (Array.isArray(res)) {
            expect(res.length).toBe(3);
            expect(res[0]).toBe('8');
            expect(res[1]).toBe('9');
            expect(res[2]).toBe('10');
        }
    });

    test('pidStringSplitAndSort returns a sorted string array with multiple inputs containing alphabetic characters', () => {
        const res = pidStringSplitAndSort('Abd9|aB10|8');
        expect(Array.isArray(res)).toBe(true); // this is how js behaves with arrays
        if (Array.isArray(res)) {
            expect(res.length).toBe(3);
            expect(res[0]).toBe('8');
            expect(res[1]).toBe('aB10');
            expect(res[2]).toBe('Abd9');
        }
    });

    test('pidStringSplitAndSort throws an error if given an empty string input', () => {
        expect(() => {
            pidStringSplitAndSort('');
        }).toThrow(
            `Error in pidStringSplitAndSort: No pid to parse in input ''`,
        );
    });

    test('pidStringSort returns a sorted string array if there are multiple valid inputs in the string', () => {
        const res = pidStringSort('9|10|8');
        expect(res).toBe('8|9|10');
    });

    test('pidStringSort throws an error if given an empty string input', () => {
        expect(() => {
            pidStringSort('');
        }).toThrow(`Error in pidStringSort: No pid to parse in input ''`);
    });

    test('sortActivePinResults works with multiple entries for the same title', () => {
        const pin1 = new ActivePin();
        pin1.pids = '1234|5678';
        pin1.titleNumber = 'EFGH';
        pin1.landTitleDistrict = 'BC';
        pin1.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
        pin1.lastName_1 = 'None';
        pin1.incorporationNumber = '91011';
        pin1.addressLine_1 = '123 example st';
        pin1.city = 'Vancouver';
        pin1.provinceAbbreviation = 'BC';
        pin1.country = 'Canada';
        pin1.postalCode = 'V1V1V1';
        const pin2 = new ActivePin();
        pin2.pids = '1234|5678';
        pin2.titleNumber = 'EFGH';
        pin2.landTitleDistrict = 'BC';
        pin2.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
        pin2.lastName_1 = 'ABCD';
        pin2.incorporationNumber = '91011';
        pin2.addressLine_1 = '123 example st';
        pin2.city = 'Vancouver';
        pin2.provinceAbbreviation = 'BC';
        pin2.country = 'Canada';
        pin2.postalCode = 'V1V1V1';
        const result = [pin1, pin2];
        const sortedResults = sortActivePinResults(result);
        expect(sortedResults['EFGH|BC']).toBeDefined();
        expect(sortedResults['EFGH|BC'].length).toBe(2);
    });
});
