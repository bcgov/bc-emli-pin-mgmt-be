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
 * A error that can occur when there are one or more validation errors for a given request
 * @example {
 * 	"message": "Validation Error(s) occured in createPin request body:",
 *  "faults": ["Phone number OR email required","Given + Last Name OR Incorporation Number required"]
 * }
 */
export interface aggregateValidationErrorType {
    message: string;
    faults: string[];
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
 * @example {
 * "pin": "abcdefgh"
 * }
 */
export interface createdPIN {
    pin: string;
}

/**
 * A PIN updated for a homeowner and its corresponding parcel & database identifiers. Defaults to 8 character length and
 * all numbers + lowercase letters as the character set.
 * @example {
 * "pin": "abcdefgh",
 * "pid": 1234,
 * "livePinId": "cf430240-e5b6-4224-bd71-a02e098cc6e8"
 * }
 */
export interface updatedPIN {
    pin: string;
    pid: number;
    livePinId: string;
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
 * An object containing property details
 *
 * @example {
 *     "pid": 1234567,
 *     "titleNumber": "12345",
 *     "landTitleDistrict": "AB",
 *     "givenName": "firstname",
 *     "lastName_1": "lastname",
 *     "lastName_2": null,
 *     "incorporationNumber": null,
 *     "addressLine_1": "123 Main Street",
 *     "addressLine_2": "",
 *     "city": "Vancouver",
 *     "province": "BC",
 *     "otherGeographicDivision": null,
 *     "country": "Canada",
 *     "postalCode": "A1B2C3"
 * }
 *
 */
export interface propertyDetailsResponse {
    [key: string]: string;
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
 * Unauthorized Error
 * @example {
 * 	 "message": "Unauthorized error",
 *   "code": 401
 * }
 */
export interface unauthorizedError {
    message: string;
    code: number;
}

/**
 * Bad Request Error
 * @example {
 * 	 "message": "Bad request error",
 *   "code": 400
 * }
 */
export interface badRequestError {
    message: string;
    code: number;
}

/**
 * Forbidden Error
 * @example {
 * 	 "message": "Forbidden error",
 *   "code": 403
 * }
 */
export interface forbiddenError {
    message: string;
    code: number;
}

/**
 * Not Found Error
 * @example {
 * 	 "message": "Not found error",
 *   "code": 404
 * }
 */
export interface notFoundError {
    message: string;
    code: number;
}

/**
 * PID Not Found
 * @example {
 * 	 "message": "PID not found in database",
 *   "code": 204
 * }
 */
export interface pidNotFound {
    message: string;
    code: number;
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

/**
 * The request body for a pin creation / recreation request.
 * The address fields given are for a mailing address, which is
 * not necessarily the same as the property address, hence the need
 * for the pid as well.
 * Certain combinations of fields are required in addition to always required fields:
 * - (givenName & lastName_1/lastName_2) OR incorporationNumber
 * - phoneNumber AND/OR email
 * - requesterName and requesterUsername are required if an employee is requesting the creation,
 *  rather than self serve
 * @example {
 * "phoneNumber": "19021234567",
 * "pid": "1234|5678",
 * "givenName": "Jane",
 * "lastName_1": "Smith",
 * "lastName_2": "Green",
 * "addressLine_1": "123 Main St",
 * "addressLine_2": "Unit 12",
 * "city": "Vancouver",
 * "provinceAbbreviation": "BC",
 * "country": "Canada",
 * "postalCode": "V1V1V1"
 * }
 */
export interface createPinRequestBody {
    pinLength?: number;
    allowedChars?: string;
    phoneNumber?: string;
    email?: string;
    pid: number | string;
    givenName?: string;
    lastName_1?: string;
    lastName_2?: string;
    incorporationNumber?: string;
    addressLine_1?: string;
    addressLine_2?: string;
    city?: string;
    provinceAbbreviation?: string;
    provinceLong?: string;
    country?: string;
    postalCode?: string;
    requesterName?: string;
    requesterUsername?: string;
}

/**
 * The email and/or phone number to send a new pin to
 * @example {
 * 	"email": "example@example.com",
 *  "phoneNumber": "19021234567"
 * }
 */
export interface emailPhone {
    email?: string;
    phoneNumber?: string;
}

/**
 * The reason for adding an entry to the pin audit log.
 * - Deleted PIN  = 'D',
 * - (Initially) Created PIN = 'C',
 * - Recreated (expire and create) PIN = 'R'
 */
export enum pinAuditAction {
    deleted = 'D',
    created = 'C',
    recreated = 'R',
}
