// Testing for only the private functions of the pin controller that will not be tested through the endpoint

import { PINController } from '../../controllers/pinController';
import { ActivePin } from '../../entity/ActivePin';
import { addressMatchScore } from '../../helpers/types';
import {
    invalidCreatePinBodyIncorrectPhone,
    invalidCreatePinBodyNoCountry,
    invalidCreatePinBodyNoPhoneEmail,
    validCreatePinBodyInc,
    validCreatePinBodyName,
    weightsThresholds,
} from '../commonResponses';

describe('pinController private function tests', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let proto: { pinRequestBodyValidate: () => void }, controller;
    beforeAll(() => {
        controller = new PINController();
        proto = Object.getPrototypeOf(controller);
    });
    // pinRequestBodyValidate tests
    test('pinRequestBodyValidate should accept valid request body with incorporation number', () => {
        const body = validCreatePinBodyInc;
        const result: string[] = (proto as any).pinRequestBodyValidate(body);
        expect(result.length).toBe(0);
    });

    test('pinRequestBodyValidate should accept valid request body with name', () => {
        const body = validCreatePinBodyName;
        body.phoneNumber = '+19021234567';
        const result: string[] = (proto as any).pinRequestBodyValidate(body);
        expect(result.length).toBe(0);
    });

    test('pinRequestBodyValidate should fail request body with no email or phone number', () => {
        const body = invalidCreatePinBodyNoPhoneEmail;
        const result: string[] = (proto as any).pinRequestBodyValidate(body);
        expect(result.length).toBe(1);
        expect(result[0]).toBe('Phone number OR email required');
    });

    test('pinRequestBodyValidate should fail request body with bad phone number', () => {
        const body = invalidCreatePinBodyIncorrectPhone;
        const result: string[] = (proto as any).pinRequestBodyValidate(body);
        expect(result.length).toBe(1);
        expect(result[0]).toBe(
            'Phone number must be a valid, 10 digit North American phone number prefixed with 1 or +1',
        );
    });

    // pinResultValidate tests
    test('pinResultValidate should return a perfect score on valid comparison with incorporation number', async () => {
        const weightsThresholds = await (proto as any).dynamicImportCaller();
        const pin: ActivePin = new ActivePin();
        const body = validCreatePinBodyInc;
        body.addressLine_2 = 'Unit 100';
        pin.pids = '1234|5678';
        pin.incorporationNumber = '91011';
        pin.lastName_1 = 'None';
        pin.addressLine_1 = '123 example st';
        pin.addressLine_2 = 'Unit 100';
        pin.city = 'Vancouver';
        pin.provinceAbbreviation = 'BC';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';

        const score: addressMatchScore = await (proto as any).pinResultValidate(
            body,
            pin,
            1,
            weightsThresholds,
        );
        expect(score.weightedAverage).toBe(1);
    });

    test('pinResultValidate should return a perfect score on valid comparison with name', async () => {
        const weightsThresholds = await (proto as any).dynamicImportCaller();
        const pin: ActivePin = new ActivePin();
        const body = validCreatePinBodyName;
        pin.pids = '1234|5678';
        pin.givenName = 'John';
        pin.lastName_1 = 'Smith';
        body.lastName_2 = 'Appleseed';
        pin.lastName_2 = 'Appleseed';
        pin.addressLine_1 = '123 example st';
        pin.city = 'Vancouver';
        pin.provinceAbbreviation = 'BC';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';

        const score: addressMatchScore = await (proto as any).pinResultValidate(
            body,
            pin,
            1,
            weightsThresholds,
        );
        expect(score.weightedAverage).toBe(1);
        delete body.lastName_2;
    });

    test('pinResultValidate should return a less than perfect score with the street not matching', async () => {
        const weightsThresholds = await (proto as any).dynamicImportCaller();
        const pin: ActivePin = new ActivePin();
        const body = validCreatePinBodyName;
        pin.pids = '1234|5678';
        pin.givenName = 'John';
        pin.lastName_1 = 'Smith';
        pin.addressLine_1 = '123 main st';
        pin.city = 'Vancouver';
        pin.provinceAbbreviation = 'BC';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';

        const score: addressMatchScore = await (proto as any).pinResultValidate(
            body,
            pin,
            1,
            weightsThresholds,
        );
        const weights = (await (proto as any).dynamicImportCaller()).weights;
        if (weights.streetAddressWeight > 0) {
            expect(score.streetAddressScore).toBeLessThan(
                weights.streetAddressWeight,
            );
            expect(score.weightedAverage).toBeLessThan(1);
        }
    });

    test('pinResultValidate should return the appropriate score according to threshold with last name not matching', async () => {
        const weightsThresholds = await (proto as any).dynamicImportCaller();
        const pin: ActivePin = new ActivePin();
        const body = validCreatePinBodyName;
        pin.pids = '1234|5678';
        pin.givenName = 'John';
        pin.lastName_1 = 'All';
        pin.addressLine_1 = '123 example st';
        pin.city = 'Vancouver';
        pin.provinceAbbreviation = 'BC';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';

        const score: addressMatchScore = await (proto as any).pinResultValidate(
            body,
            pin,
            1,
            weightsThresholds,
        );
        const weights = (await (proto as any).dynamicImportCaller()).weights;
        if (weights.lastNamesWeight > 0) {
            expect(score.lastNamesScore).toBe(0);
            expect(score.weightedAverage).toBeLessThan(1);
        }
    });

    test('pinResultValidate should return less than a perfect score with province not matching', async () => {
        const weightsThresholds = await (proto as any).dynamicImportCaller();
        const pin: ActivePin = new ActivePin();
        const body = validCreatePinBodyName;
        pin.pids = '1234|5678';
        pin.givenName = 'John';
        pin.lastName_1 = 'Smith';
        pin.addressLine_1 = '123 example st';
        pin.city = 'Vancouver';
        pin.provinceAbbreviation = 'ON';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';

        const score: addressMatchScore = await (proto as any).pinResultValidate(
            body,
            pin,
            1,
            weightsThresholds,
        );
        const weights = (await (proto as any).dynamicImportCaller()).weights;
        if (weights.provinceAbbreviationWeight > 0) {
            expect(score.provinceAbbreviationScore).toBeLessThan(
                weights.provinceAbbreviationWeight,
            );
            expect(score.weightedAverage).toBeLessThan(1);
        }
    });

    test('pinResultValidate should return less than a perfect score with postal code in pin but not body', async () => {
        const weightsThresholds = await (proto as any).dynamicImportCaller();
        const pin: ActivePin = new ActivePin();
        const body = validCreatePinBodyName;
        body.postalCode = undefined;
        pin.pids = '1234|5678';
        pin.givenName = 'John';
        pin.lastName_1 = 'Smith';
        pin.addressLine_1 = '123 example st';
        pin.city = 'Vancouver';
        pin.provinceAbbreviation = 'BC';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';

        const score: addressMatchScore = await (proto as any).pinResultValidate(
            body,
            pin,
            1,
            weightsThresholds,
        );
        const weights = (await (proto as any).dynamicImportCaller()).weights;
        if (weights.postalCodeWeight > 0) {
            expect(score.postalCodeScore).toBe(0);
            expect(score.weightedAverage).toBeLessThan(1);
        }
    });

    test('pinResultValidate should return less than a perfect score with postal code not matching', async () => {
        const weightsThresholds = await (proto as any).dynamicImportCaller();
        const pin: ActivePin = new ActivePin();
        const body = validCreatePinBodyName;
        body.postalCode = 'ABCDEFG';
        body.city = undefined;
        body.provinceAbbreviation = undefined;
        body.country = undefined;
        pin.pids = '1234|5678';
        pin.givenName = 'John';
        pin.lastName_1 = 'Smith';
        pin.addressLine_1 = '123 example st';
        pin.postalCode = 'V1V1V2';

        const score: addressMatchScore = await (proto as any).pinResultValidate(
            body,
            pin,
            1,
            weightsThresholds,
        );
        const weights = (await (proto as any).dynamicImportCaller()).weights;
        if (weights.postalCodeWeight > 0) {
            expect(score.postalCodeScore).toBeLessThan(
                weights.postalCodeWeight,
            );
            expect(score.weightedAverage).toBeLessThan(1);
        }
    });

    test('pinResultValidate should not score postal code when not present in pin', async () => {
        const weightsThresholds = await (proto as any).dynamicImportCaller();
        const pin: ActivePin = new ActivePin();
        const body = validCreatePinBodyName;
        body.city = 'Vancouver';
        body.provinceAbbreviation = 'BC';
        body.country = 'Canada';
        pin.pids = '1234|5678';
        pin.givenName = 'John';
        pin.lastName_1 = 'Smith';
        pin.addressLine_1 = '123 example st';
        pin.city = 'Vancouver';
        pin.provinceAbbreviation = 'BC';
        pin.country = 'Canada';

        const score: addressMatchScore = await (proto as any).pinResultValidate(
            body,
            pin,
            1,
            weightsThresholds,
        );
        expect(score.postalCodeScore).toBeUndefined();
        expect(score.weightedAverage).toBe(1);
    });

    test('pinResultValidate should return lower score with non matching incorporation number', async () => {
        const weightsThresholds = await (proto as any).dynamicImportCaller();
        const pin: ActivePin = new ActivePin();
        const newbody = validCreatePinBodyInc;
        pin.pids = '1234|5678';
        pin.lastName_1 = 'None';
        pin.incorporationNumber = 'abcdefg';
        pin.addressLine_1 = '123 example st';
        pin.city = 'Vancouver';
        pin.provinceAbbreviation = 'BC';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';
        const score: addressMatchScore = await (proto as any).pinResultValidate(
            newbody,
            pin,
            1,
            weightsThresholds,
        );
        const weights = (await (proto as any).dynamicImportCaller()).weights;
        if (weights.incorporationNumberWeight > 0) {
            expect(score.incorporationNumberScore).toBeLessThan(
                weights.incorporationNumberWeight,
            );
            expect(score.weightedAverage).toBeLessThan(1);
        }
    });

    test('pinResultValidate should return lower score with incorporation number in pin but not body', async () => {
        const weightsThresholds = await (proto as any).dynamicImportCaller();
        const pin: ActivePin = new ActivePin();
        const newbody = validCreatePinBodyInc;
        newbody.incorporationNumber = undefined;
        pin.pids = '1234|5678';
        pin.lastName_1 = 'None';
        pin.incorporationNumber = 'abcdefg';
        pin.addressLine_1 = '123 example st';
        pin.city = 'Vancouver';
        pin.provinceAbbreviation = 'BC';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';
        const score: addressMatchScore = await (proto as any).pinResultValidate(
            newbody,
            pin,
            1,
            weightsThresholds,
        );
        const weights = (await (proto as any).dynamicImportCaller()).weights;
        if (weights.incorporationNumberWeight > 0) {
            expect(score.incorporationNumberScore).toBe(0);
            expect(score.weightedAverage).toBeLessThan(1);
        }
    });

    test(`pinResultValidate should return lower score with city not matching`, async () => {
        const weightsThresholds = await (proto as any).dynamicImportCaller();
        const pin: ActivePin = new ActivePin();
        const newbody = validCreatePinBodyName;
        pin.pids = '1234|5678';
        pin.givenName = 'Jane';
        pin.lastName_1 = 'Smith';
        pin.addressLine_1 = '123 example st';
        pin.city = 'LLLL';
        pin.provinceAbbreviation = 'BC';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';
        const score: addressMatchScore = await (proto as any).pinResultValidate(
            newbody,
            pin,
            1,
            weightsThresholds,
        );
        const weights = (await (proto as any).dynamicImportCaller()).weights;
        if (weights.cityWeight > 0) {
            expect(score.cityScore).toBe(0);
            expect(score.weightedAverage).toBeLessThan(1);
        }
    });

    test(`pinResultValidate should return lower score with city in pin but not body`, async () => {
        const weightsThresholds = await (proto as any).dynamicImportCaller();
        const pin: ActivePin = new ActivePin();
        const newbody = validCreatePinBodyName;
        newbody.city = undefined;
        pin.pids = '1234|5678';
        pin.givenName = 'Jane';
        pin.lastName_1 = 'Smith';
        pin.addressLine_1 = '123 example st';
        pin.city = 'Vancouver';
        pin.provinceAbbreviation = 'BC';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';
        const score: addressMatchScore = await (proto as any).pinResultValidate(
            newbody,
            pin,
            1,
            weightsThresholds,
        );
        const weights = (await (proto as any).dynamicImportCaller()).weights;
        if (weights.cityWeight > 0) {
            expect(score.cityScore).toBe(0);
            expect(score.weightedAverage).toBeLessThan(1);
        }
    });

    test(`pinResultValidate should return lower score with province in pin but not body`, async () => {
        const weightsThresholds = await (proto as any).dynamicImportCaller();
        const pin: ActivePin = new ActivePin();
        const newbody = validCreatePinBodyName;
        newbody.provinceAbbreviation = undefined;
        pin.pids = '1234|5678';
        pin.givenName = 'Jane';
        pin.lastName_1 = 'Smith';
        pin.addressLine_1 = '123 example st';
        pin.city = 'Vancouver';
        pin.provinceAbbreviation = 'BC';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';
        const score: addressMatchScore = await (proto as any).pinResultValidate(
            newbody,
            pin,
            1,
            weightsThresholds,
        );
        const weights = (await (proto as any).dynamicImportCaller()).weights;
        if (weights.provinceAbbreviationWeight > 0) {
            expect(score.provinceAbbreviationScore).toBe(0);
            expect(score.weightedAverage).toBeLessThan(1);
        }
    });

    test('pinResultValidate should return lower score with country not matching', async () => {
        const pin: ActivePin = new ActivePin();
        const newbody = invalidCreatePinBodyNoCountry;
        newbody.country = 'Sweden';
        pin.pids = '1234|5678';
        pin.addressLine_1 = '123 example st';
        pin.lastName_1 = 'None';
        pin.city = 'Vancouver';
        pin.provinceAbbreviation = 'BC';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';
        const score: addressMatchScore = await (proto as any).pinResultValidate(
            newbody,
            pin,
            1,
            weightsThresholds,
        );
        const weights = (await (proto as any).dynamicImportCaller()).weights;
        if (weights.countryWeight > 0) {
            expect(score.countryScore).toBeLessThan(weights.countryWeight);
            expect(score.weightedAverage).toBeLessThan(1);
        }
    });

    test('pinResultValidate should return lower score with country in pin but not body', async () => {
        const weightsThresholds = await (proto as any).dynamicImportCaller();
        const pin: ActivePin = new ActivePin();
        const newbody = invalidCreatePinBodyNoCountry;
        newbody.country = undefined;
        pin.pids = '1234|5678';
        pin.addressLine_1 = '123 example st';
        pin.lastName_1 = 'None';
        pin.city = 'Vancouver';
        pin.provinceAbbreviation = 'BC';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';
        const score: addressMatchScore = await (proto as any).pinResultValidate(
            newbody,
            pin,
            1,
            weightsThresholds,
        );
        const weights = (await (proto as any).dynamicImportCaller()).weights;
        if (weights.countryWeight > 0) {
            expect(score.countryScore).toBeLessThan(weights.countryWeight);
            expect(score.weightedAverage).toBeLessThan(1);
        }
    });

    test(`pinResultValidate should return lower score if given name doesn't match`, async () => {
        const weightsThresholds = await (proto as any).dynamicImportCaller();
        const pin: ActivePin = new ActivePin();
        const newbody = validCreatePinBodyName;
        pin.pids = '1234|5678';
        pin.givenName = 'Jane';
        pin.lastName_1 = 'Smith';
        pin.addressLine_1 = '123 example st';
        pin.city = 'Vancouver';
        pin.provinceAbbreviation = 'BC';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';
        const score: addressMatchScore = await (proto as any).pinResultValidate(
            newbody,
            pin,
            1,
            weightsThresholds,
        );
        const weights = (await (proto as any).dynamicImportCaller()).weights;
        if (weights.givenNameWeight > 0) {
            expect(score.givenNameScore).toBeLessThan(weights.givenNameWeight);
            expect(score.weightedAverage).toBeLessThan(1);
        }
    });

    test(`pinResultValidate should return lower score with given name in pin but not body`, async () => {
        const weightsThresholds = await (proto as any).dynamicImportCaller();
        const pin: ActivePin = new ActivePin();
        const newbody = validCreatePinBodyName;
        newbody.givenName = undefined;
        pin.pids = '1234|5678';
        pin.givenName = 'Jane';
        pin.lastName_1 = 'Smith';
        pin.addressLine_1 = '123 example st';
        pin.city = 'Vancouver';
        pin.provinceAbbreviation = 'BC';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';
        const score: addressMatchScore = await (proto as any).pinResultValidate(
            newbody,
            pin,
            1,
            weightsThresholds,
        );
        const weights = (await (proto as any).dynamicImportCaller()).weights;
        if (weights.givenNameWeight > 0) {
            expect(score.givenNameScore).toBe(0);
            expect(score.weightedAverage).toBeLessThan(1);
        }
    });

    test('pinResultValidate should return faults when lacking city, postal code, addressline_1 and lastName_1 in pin', async () => {
        const weightsThresholds = await (proto as any).dynamicImportCaller();
        const pin: ActivePin = new ActivePin();
        const body = validCreatePinBodyName;
        pin.pids = '1234|5678';
        pin.addressLine_1 = 'NO ADDRESS ON FILE FOR THIS OWNER';
        pin.givenName = 'John';
        pin.provinceAbbreviation = 'ON';
        pin.country = 'Canada';

        const faults: string[] = await (proto as any).pinResultValidate(
            body,
            pin,
            1,
            weightsThresholds,
        );
        expect(faults.length).toBe(3);
        expect(faults[0]).toBe(
            'No address is on file for this owner: please contact service BC to create or recreate your PIN',
        );
        expect(faults[1]).toBe(
            'No legal name or corporation name is on file for this owner: please contact service BC to create or recreate your PIN',
        );
        expect(faults[2]).toBe(
            'No city or postal / zip code is on file for this owner: please contact service BC to create or recreate your PIN',
        );
    });

    test('pinResultValidate should throw an error when the number of owners in pin and parameters does not match', async () => {
        const weightsThresholds = await (proto as any).dynamicImportCaller();
        const pin: ActivePin = new ActivePin();
        const body = validCreatePinBodyName;
        pin.pids = '1234|5678';
        pin.givenName = 'John';
        pin.lastName_1 = 'Smith';
        pin.addressLine_1 = '123 example st';
        pin.city = 'Vancouver';
        pin.provinceAbbreviation = 'ON';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';

        await expect(
            (proto as any).pinResultValidate(body, pin, 7, weightsThresholds),
        ).rejects.toThrow('Number of owners does not match -- automatic fail.');
    });

    // dynamicImportCaller tests
    test(`dynamicImportCaller throws error if a required field is of the wrong type`, async () => {
        jest.spyOn(JSON, 'parse').mockImplementationOnce(() => {
            return {};
        });
        expect(() => {
            (proto as any).dynamicImportCaller();
        }).toThrow('Missing required fields in import');
    });

    test(`dynamicImportCaller throws error if a threshold is higher than allowed`, async () => {
        jest.spyOn(JSON, 'parse').mockImplementationOnce(() => {
            return {
                weights: { a: 1 },
                thresholds: { b: 20 },
                fuzzinessCoefficients: { c: 5 },
                streetAddressLooseMatchReductionCoefficient: 0.2,
            };
        });
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const result = (proto as any).dynamicImportCaller();
        } catch (err) {
            if (err instanceof AggregateError) {
                expect(err.errors).toHaveLength(2);
                expect(err.errors[0]).toBe(
                    'Invalid scoring threshold "b". Please provide thresholds between 0 and 1 inclusive.',
                );
                expect(err.errors[1]).toBe(
                    'Invalid fuzziness coefficient "c". Please provide fuzziness coeffiecients less than or equal to 1.',
                );
                return;
            }
        }
        fail();
    });

    // score test
    test(`score returns a value`, () => {
        expect((proto as any).score('ab', 'ab', 0.9)).toBe(1);
    });
});
