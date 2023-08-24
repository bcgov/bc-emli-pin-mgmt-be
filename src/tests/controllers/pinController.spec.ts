// Testing for only the private functions of the pin controller that will not be tested through the endpoint

import { PINController } from '../../controllers/pinController';
import { ActivePin } from '../../entity/ActivePin';
import {
    invalidCreatePinBodyBothIncName,
    invalidCreatePinBodyIncorrectPhone,
    invalidCreatePinBodyNoIncName,
    invalidCreatePinBodyNoPhoneEmail,
    validCreatePinBodyInc,
    validCreatePinBodyName,
} from '../commonResponses';

describe('pinController private function tests', () => {
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
        const result: string[] = (proto as any).pinRequestBodyValidate(body);
        expect(result.length).toBe(0);
    });

    test('pinRequestBodyValidate should fail request body without incorporation number or name', () => {
        const body = invalidCreatePinBodyNoIncName;
        const result: string[] = (proto as any).pinRequestBodyValidate(body);
        expect(result.length).toBe(1);
        expect(result[0]).toBe(
            'Given + Last Name OR Incorporation Number required',
        );
    });

    test('pinRequestBodyValidate should fail request body with both incorporation number and name', () => {
        const body = invalidCreatePinBodyBothIncName;
        const result: string[] = (proto as any).pinRequestBodyValidate(body);
        expect(result.length).toBe(1);
        expect(result[0]).toBe(
            'Both Name and Incorporation Number CANNOT be given',
        );
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
            'Phone number must be a vaild, 10 digit North American phone number prefixed with 1 or +1',
        );
    });

    // pinResultValidate tests
    test('pinResultValidate should return true on valid comparison with incorporation number', () => {
        const pin: ActivePin = new ActivePin();
        const body = validCreatePinBodyInc;
        pin.pid = 5678;
        pin.incorporationNumber = '91011';
        pin.addressLine_1 = '123 example st';
        pin.city = 'Vancouver';
        pin.province = 'BC';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';

        const isValid: boolean = (proto as any).pinResultValidate(body, pin);
        expect(isValid).toBe(true);
    });

    test('pinResultValidate should return true on valid comparison with name', () => {
        const pin: ActivePin = new ActivePin();
        const body = validCreatePinBodyName;
        pin.pid = 5678;
        pin.givenName = 'John';
        pin.lastName_1 = 'Smith';
        pin.addressLine_1 = '123 example st';
        pin.city = 'Vancouver';
        pin.province = 'BC';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';

        const isValid: boolean = (proto as any).pinResultValidate(body, pin);
        expect(isValid).toBe(true);
    });

    test('pinResultValidate should return false with an always required field not matching', () => {
        const pin: ActivePin = new ActivePin();
        const body = validCreatePinBodyName;
        pin.pid = 5678;
        pin.givenName = 'John';
        pin.lastName_1 = 'Smith';
        pin.addressLine_1 = '123 main st';
        pin.city = 'Vancouver';
        pin.province = 'BC';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';

        const isValid: boolean = (proto as any).pinResultValidate(body, pin);
        expect(isValid).toBe(false);
    });

    test('pinResultValidate should return false with last name 2 in pin but not body', () => {
        const pin: ActivePin = new ActivePin();
        const body = validCreatePinBodyName;
        pin.pid = 5678;
        pin.givenName = 'John';
        pin.lastName_1 = 'Smith';
        pin.lastName_2 = 'Appleseed';
        pin.addressLine_1 = '123 example st';
        pin.city = 'Vancouver';
        pin.province = 'BC';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';

        const isValid: boolean = (proto as any).pinResultValidate(body, pin);
        expect(isValid).toBe(false);
    });

    test('pinResultValidate should return false with address line 2 in pin but not body', () => {
        const pin: ActivePin = new ActivePin();
        const body = validCreatePinBodyName;
        pin.pid = 5678;
        pin.givenName = 'John';
        pin.lastName_1 = 'Smith';
        pin.addressLine_1 = '123 example st';
        pin.addressLine_2 = 'Unit 100A';
        pin.city = 'Vancouver';
        pin.province = 'BC';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';

        const isValid: boolean = (proto as any).pinResultValidate(body, pin);
        expect(isValid).toBe(false);
    });

    test('pinResultValidate should return false with province not matching', () => {
        const pin: ActivePin = new ActivePin();
        const body = validCreatePinBodyName;
        pin.pid = 5678;
        pin.givenName = 'John';
        pin.lastName_1 = 'Smith';
        pin.addressLine_1 = '123 example st';
        pin.city = 'Vancouver';
        pin.province = 'ON';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';

        const isValid: boolean = (proto as any).pinResultValidate(body, pin);
        expect(isValid).toBe(false);
    });

    test('pinResultValidate should return false with otherGeographicDivision given in pin but not body', () => {
        const pin: ActivePin = new ActivePin();
        const body = validCreatePinBodyName;
        pin.pid = 5678;
        pin.givenName = 'John';
        pin.lastName_1 = 'Smith';
        pin.addressLine_1 = '123 example st';
        pin.city = 'Vancouver';
        pin.province = 'BC';
        pin.otherGeographicDivision = 'Lower Mainland';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';

        const isValid: boolean = (proto as any).pinResultValidate(body, pin);
        expect(isValid).toBe(false);
    });

    test('pinResultValidate should return false with postalCode in body but not pin', () => {
        const pin: ActivePin = new ActivePin();
        const body = validCreatePinBodyName;
        pin.pid = 5678;
        pin.givenName = 'John';
        pin.lastName_1 = 'Smith';
        pin.addressLine_1 = '123 example st';
        pin.city = 'Vancouver';
        pin.province = 'BC';
        pin.country = 'Canada';

        const isValid: boolean = (proto as any).pinResultValidate(body, pin);
        expect(isValid).toBe(false);
    });

    test('pinResultValidate should return false with incorporation number in body but not pin', () => {
        const pin: ActivePin = new ActivePin();
        const body = validCreatePinBodyInc;
        pin.pid = 5678;
        pin.givenName = 'John';
        pin.lastName_1 = 'Smith';
        pin.addressLine_1 = '123 example st';
        pin.city = 'Vancouver';
        pin.province = 'BC';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';

        const isValid: boolean = (proto as any).pinResultValidate(body, pin);
        expect(isValid).toBe(false);
    });

    test('pinResultValidate should return false with name in body but not pin', () => {
        const pin: ActivePin = new ActivePin();
        const body = validCreatePinBodyName;
        pin.pid = 5678;
        pin.incorporationNumber = '91011';
        pin.addressLine_1 = '123 example st';
        pin.city = 'Vancouver';
        pin.province = 'BC';
        pin.country = 'Canada';
        pin.postalCode = 'V1V1V1';

        const isValid: boolean = (proto as any).pinResultValidate(body, pin);
        expect(isValid).toBe(false);
    });
});
