/**
 * Generic range error that may occur when you give a value out of bounds to a pin function
 * @example {
 * 	"message": "PIN must be of length 1 or greater"
 * }
 */
export interface pinRangeErrorType {
    message: string;
}

/**
 * Generic unknown server error
 * @example {
 * 	"message": "Internal Server Error"
 * }
 */
export interface serverErrorType {
    message: string;
}

/**
 * A PIN generated for a homeowner. Defaults to 8 character length and
 * all numbers + lowercase letters as the character set.
 * @example "abcdefgh"
 */
export type PIN = string;

/**
 * A PIN generated for a homeowner, checked for uniqueness against the database. Defaults to 8 character length and
 * all numbers + lowercase letters as the character set.
 * @example "abcdefgh"
 */
export interface createdPIN {
    pin: string;
}

/**
 * An object containing an array of unique, generated PINS
 *
 * @example {
 * 	 "pins": ["abcdefgh","12345678"]
 * }
 */
export interface PINObject {
    pins: PIN[];
}

/**
 * An object containing PINs as the keys, and the quantity of each PIN as the value
 * Note that the value should always be one.
 *
 * @example {
 * 	 "abcdefgh": 1
 * 	 "12345678": 1
 * }
 */
export interface PINDictionary {
    [key: PIN]: number;
}

/**
 * An object containing property details
 *
 * @example {
 *  "owners_first_name": "firstname",
 *  "owners_last_name": "lastname",
 *  "owners_mailing_address": "101 Main Street"
 * }
 *
 */
export interface propertyDetailsResponse {
    [key: string]: string;
}
