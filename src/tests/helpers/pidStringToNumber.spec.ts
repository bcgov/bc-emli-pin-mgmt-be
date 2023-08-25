import { pidStringToNumber } from '../../helpers/pidStringToNumber';

describe('pidStringToNumber tests', () => {
    test('pidStringToNumber returns the number if the input is of type number', () => {
        const res = pidStringToNumber(8);
        expect(typeof res).toBe('number');
        expect(res).toBe(8);
    });

    test('pidStringToNumber returns a number if there is a single valid input of type string', () => {
        const res = pidStringToNumber('8');
        expect(typeof res).toBe('number');
        expect(res).toBe(8);
    });

    test('pidStringToNumber returns a number array if there are multiple valid inputs in the string', () => {
        const res = pidStringToNumber('8|9|10');
        expect(Array.isArray(res)).toBe(true); // this is how js behaves with arrays
        if (Array.isArray(res)) {
            expect(res.length).toBe(3);
            expect(res[0]).toBe(8);
            expect(res[1]).toBe(9);
            expect(res[2]).toBe(10);
        }
    });

    test('pidStringToNumber throws an error if given an empty string input', () => {
        expect(() => {
            pidStringToNumber('');
        }).toThrow(`Error in pidStringToNumber: No pid to parse in input ''`);
    });

    test('pidStringToNumber throws an error if given a single non integer input', () => {
        expect(() => {
            pidStringToNumber('qrst');
        }).toThrow(
            `Error in pidStringToNumber: pid(s) given (qrst) are invalid`,
        );
    });

    test('pidStringToNumber throws an error if given an out of range input', () => {
        expect(() => {
            pidStringToNumber(
                '999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999',
            );
        }).toThrow(
            `Error in pidStringToNumber: pid(s) given (999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999) are invalid`,
        );
    });

    test('pidStringToNumber throws an error if given multiple non integer inputs', () => {
        expect(() => {
            pidStringToNumber('12ab|56er|1678');
        }).toThrow(
            `Error in pidStringToNumber: pid(s) given (12ab|56er|1678) are invalid`,
        );
    });

    test('pidStringToNumber throws an error if given multiple out of range inputs', () => {
        expect(() => {
            pidStringToNumber(
                '999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999|9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999998',
            );
        }).toThrow(
            `Error in pidStringToNumber: pid(s) given (999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999|9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999998) are invalid`,
        );
    });
});
