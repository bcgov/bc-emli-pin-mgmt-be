import { pidStringSort, pidStringSplitAndSort } from '../../helpers/pidHelpers';

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
});
