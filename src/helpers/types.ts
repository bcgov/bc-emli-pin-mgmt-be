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
 * Generic range error that may occur when you give a value out of bounds to a search function
 * @example {
 * 	"message": "Search string must be of length 3 or greater"
 * }
 */
export interface searchRangeErrorType {
    message: string;
}

/**
 * Reference error that may occur when you have not defined the API environment variables for the geocoder functions
 * @example {
 * 	"message": "Geocoder API base URL or 'addresses' endpoint URL is undefined."
 * }
 */
export interface geocoderReferenceErrorType {
    message: string;
}

/**
 * Error that occurs when an entity cannot be found in the database meeting your search criteria
 * @example {
 * 	"message": "Could not find any entity of type \"ActivePin\" matching: {\n\"where\": {\n\"livePinId\": \"e9bee7c0-de39-47b3-9457-34d32cf6feb4\"\n}\n}"
 * }
 */
export interface EntityNotFoundErrorType {
    message: string;
}

/**
 * A generic error given by TypeORM. Often related to invalid syntax for input parameters
 * @example {
 * 	"message": "driverError: error: invalid input syntax for type uuid: \"abcd\""
 * }
 */
export interface GenericTypeORMErrorType {
    message: string;
}

/**
 * A error that can occur when you don't give a required input parameter in the body of a request
 * @example {
 * 	"message": "Must provide an expiration name when expiring a PIN"
 * }
 */
export interface requiredFieldErrorType {
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
 * 	 "abcdefgh": 1,
 * 	 "12345678": 1
 * }
 */
export interface PINDictionary {
    [key: PIN]: number;
}

/**
 * An object containing an array of the BC Geocoder address search results.
 * @example {
 * 	 "results": [ {
 * 	 	"score": 100,
 *   	"fullAddress": "123 Example Street, City, BC",
 * 	 	"siteID": "dc1111ba-1f11-111-1eda-111ca1f111c1"
 * 		}
 * ]
 * }
 */
export interface getAddressResults {
    results: GeocoderAddress[];
}

/**
 * BC Geocoder address search result, including score, full address and site ID
 * @example {
 * 	 "score": 100,
 *   "fullAddress": "123 Example Street, City, BC",
 * 	 "siteID": "dc1111ba-1f11-111-1eda-111ca1f111c1"
 * }
 */
export interface GeocoderAddress {
    score: number;
    fullAddress: string;
    siteID: string;
}

/**
 * The reason for expiring a PIN.
 * - OptOut = 'OP'
 * - CallCenterPinReset = 'CC'
 * - OnlineReset = 'OR'
 * - ChangeOfOwnership = 'CO'
 */
export enum expirationReason {
    OptOut = 'OP',
    CallCenterPinReset = 'CC',
    OnlineReset = 'OR',
    ChangeOfOwnership = 'CO',
}

/**
 * The request body for a pin expiration request.
 * Note that expiredByName and username are only required for reasons other
 * than "CO" (change of ownership).
 * @example {
 * 	"livePinId": "ca609097-7b4f-49a7-b2e9-efb78afb3ae6",
 * 	"expirationReason": "OP",
 *  "expiredByName": "John Smith",
 *  "expiredByUsername": "jsmith"
 * }
 */
export interface expireRequestBody {
    livePinId: string;
    expirationReason: expirationReason;
    expiredByName?: string;
    expiredByUsername?: string;
}
