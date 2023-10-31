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
 * "pids": "1234",
 * "livePinId": "cf430240-e5b6-4224-bd71-a02e098cc6e8"
 * }
 */
export interface updatedPIN {
    pin?: string;
    pids: string;
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
 * 	"12345|AB" : [
 * 	  {
 *     "pids": "1234567",
 *     "titleNumber": "12345",
 *     "landTitleDistrict": "AB",
 *     "givenName": "givenName",
 *     "lastName_1": "lastname",
 *     "lastName_2": null,
 *     "incorporationNumber": null,
 *     "addressLine_1": "123 Main Street",
 *     "addressLine_2": "",
 *     "city": "Vancouver",
 *     "provinceAbbreviation": "BC",
 *     "provinceLong": null,
 *     "country": "Canada",
 *     "postalCode": "A1B2C3"
 * 	  }
 * 	]
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
  	 "message": "Bad request error",
    "code": 400
  }
 */
export interface badRequestError {
    message: string;
    code: number;
}

/**
 * Forbidden Error
 * @example {
  	 "message": "Forbidden error",
    "code": 403
  }
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
 * User role types
 */
export enum roleType {
    Admin = 'Admin',
    SuperAdmin = 'SuperAdmin',
    Standard = 'Standard',
}

/**
 * The request body for a pin expiration request.
 * Note that expiredByUsername is only required for reasons other
 * than "CO" (change of ownership).
 * @example {
 	"livePinId": "ca609097-7b4f-49a7-b2e9-efb78afb3ae6",
  	"expirationReason": "OP",
    "expiredByUsername": "jsmith",
    "propertyAddress": "123 example st",
    "email": "test@gmail.com"
  }
 */
export interface expireRequestBody {
    livePinId: string;
    expirationReason: expirationReason;
    expiredByUsername?: string;
    propertyAddress: string;
    phoneNumber?: string;
    email?: string;
}
// TODO: Change to look up by GUID??

/**
 * The request body for a pin creation / recreation request.
 * The address fields given are for a mailing address, which is
 * not necessarily the same as the property address. The property address is required to send the
 * GCNotify email / text message to the recipient.
 * Certain combinations of fields are required in addition to always required fields:
 * - (givenName & lastName_1/lastName_2) OR incorporationNumber
 * - phoneNumber AND/OR email
 * - requesterName and requesterUsername are required if an employee is requesting the creation,
 *  rather than self serve
 * @example {
  "email": "example@test.com",
  "pids": "1234|5678",
  "numberOfOwners": 2,
  "givenName": "Jane",
  "lastName_1": "Smith",
  "lastName_2": "Green",
  "addressLine_1": "123 Main St",
  "addressLine_2": "Unit 12",
  "city": "Vancouver",
  "provinceAbbreviation": "BC",
  "country": "Canada",
  "postalCode": "V1V1V1",
  "propertyAddress": "8765 Willow Way, Chilliwack, BC"
  }
 */
export interface createPinRequestBody {
    pinLength?: number;
    allowedChars?: string;
    numberOfOwners: number;
    phoneNumber?: string;
    email?: string;
    pids: string;
    givenName?: string;
    lastName_1: string;
    lastName_2?: string;
    incorporationNumber?: string;
    addressLine_1: string;
    addressLine_2?: string;
    city?: string;
    provinceAbbreviation?: string;
    country?: string;
    postalCode?: string;
    requesterUsername?: string;
    propertyAddress: string;
}

/**
 * The email and/or phone number to send a new pin to
 * @example {
  	"email": "example@example.com",
   "phoneNumber": "19021234567"
  }
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

/**
 * The information returned in an audit log request for a given pin, sorted descending
 * @example { 
 * 	logs: [
  {
    "logId": "5f926af0-f558-4b29-ace7-f4afdcdabb2d",
    "expiredAt": "2023-08-25T15:12:59.764Z",
    "expirationReason": "OR",
    "sentToEmail": null,
    "sentToPhone": "19021234567",
    "pinCreatedAt": "2023-08-24T15:01:49.628Z",
    "updatedAt": "2023-08-25T15:12:59.764Z",
    "alteredByUsername": "self",
	  "livePinId": "31be8df8-3284-4b05-bb2b-f11b7e77cba0",
    "action": "R",
    "logCreatedAt": "2023-08-25T15:12:59.764Z"
  }
 ]
}
 */
export interface auditLogReturn {
    logs: auditLogInfo[];
}

/**
 * The info returned in an audit log
 * @example
 * {
    "logId": "82dc08e5-cbca-40c2-9d35-a4d1407d5f8d",
    "expiredAt": null,
    "expirationReason": null,
    "sentToEmail": null,
    "sentToPhone": "19021234567",
    "pinCreatedAt": "2023-08-24T15:01:49.628Z",
    "updatedAt": "2023-08-24T15:06:27.269Z",
    "alteredByUsername": "self",
	"livePinId": "31be8df8-3284-4b05-bb2b-f11b7e77cba0",
    "action": "C",
    "logCreatedAt": "2023-08-24T15:06:27.269Z"
  }
 */
export interface auditLogInfo {
    logId: string;
    pin: string | null;
    expiredAt: string | null;
    expirationReason: expirationReason | null;
    sentToEmail: string | null;
    sentToPhone: string | null;
    pinCreatedAt: string;
    updatedAt: string | null;
    alteredByUsername: string | null;
    livePinId: string;
    action: pinAuditAction;
    logCreatedAt: string;
}

// User Role Types
export type UserRoles = 'Standard' | 'Admin' | 'SuperAdmin';

/**
 * Enum for status for Request Access
 */
export enum requestStatusType {
    NotGranted = 'NotGranted',
    Granted = 'Granted',
    Rejected = 'Rejected',
}

/**
 * Request body for access request submission
 * @example
 * {
    "userGuid": "82dc08e5-cbca-40c2-9d35-a4d1407d5f8d",
    "identityType": "idir",
    "requestedRole": "Admin",
    "organization": "Bc Service",
    "email": "abc@gov.ca",
    "userName": "johndoe",
    "givenName": "John",
    "lastName": "Doe",
    "requestReason": "To get access to site"
  }
 */
export interface accessRequestResponseBody {
    userGuid: string;
    identityType: string;
    requestedRole: UserRoles;
    organization: string;
    email: string;
    userName: string;
    givenName: string;
    lastName: string;
    requestReason: string;
}

/**
 * Response for access request information
 * @example
 * {
    "requestId": "82dc08e5-cbca-40c2-9d35-a4d1407d5f8d",
    "userGuid": "82dc08e5-cbca-40c2-9d35-a4d1407d5f8d",
    "identityType": "idir",
    "requestedRole": "Admin",
    "organization": "Bc Service",
    "email": "abc@gov.ca",
    "userName": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": ""2023-08-24T15:06:27.269Z",
    "requestReason": "To get access to site",
    "rejectionReason": "Information needed"
  }
 */
export interface accessRequest {
    requestId: string;
    userGuid: string;
    identityType: string;
    requestedRole: UserRoles;
    organization: string;
    email: string;
    userName: string;
    givenName: string;
    lastName: string;
    requestReason: string;
    rejectionReason: string;
    createdAt: string;
}

/**
 * Response for access request List information
 * @example
 * {
    "requestId": "82dc08e5-cbca-40c2-9d35-a4d1407d5f8d",
    "userGuid": "82dc08e5-cbca-40c2-9d35-a4d1407d5f8d",
    "identityType": "idir",
    "requestedRole": "Admin",
    "organization": "Bc Service",
    "email": "abc@gov.ca",
    "userName": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "requestStatus": "NotGranted",
    "createdAt": ""2023-08-24T15:06:27.269Z",
    "requestReason": "To get access to site",
    "rejectionReason": "Information needed"
  }
 */
export interface accessRequestList {
    requestId: string;
    userGuid: string;
    identityType: string;
    requestedRole: UserRoles;
    organization: string;
    email: string;
    userName: string;
    givenName: string;
    lastName: string;
    requestReason: string;
    requestStatus: requestStatusType;
    rejectionReason: string;
    createdAt: string;
}

/**
 * Request body for access request updates
 * @example
 * {
    "action": "Granted",
    "requestIds": ["82dc08e5-cbca-40c2-9d35-a4d1407d5f8d"],
  }
 */
export interface accessRequestUpdateRequestBody {
    action: requestStatusType;
    requestIds: string[];
    rejectionReason?: string;
}

/**
 * No Pending Request Found
 * @example {
 * 	 "message": "No pending request found",
 *   "code": 204
 * }
 */
export interface noPendingRequestFound {
    message: string;
    code: number;
}

/* A list of scores from 0 to 1 of how close a "match" an address is to the provided request information
 */
export interface addressMatchScore {
    weightedAverage: number;
    givenNameScore?: number;
    lastNamesScore: number;
    ownerNumberScore: number;
    incorporationNumberScore?: number;
    streetAddressScore: number;
    cityScore?: number;
    provinceAbbreviationScore?: number;
    countryScore?: number;
    postalCodeScore?: number;
}

/**
 * Since these results are verified by a human, much less information is required
 * than the standard create / recreate request. The property address is for sending the
 * GCNotify email/ text message, and is not used for verification. 
 * @example
 * 	{
  		"livePinId": "82dc08e5-cbca-40c2-9d35-a4d1407d5f8d",
  		"email": "example@test.com",
  		"phoneNumber": "+19021234567",
        "propertyAddress": "123 Main Street, Vancouver, BC"
  	}
 */
export interface serviceBCCreateRequestBody {
    livePinId: string;
    email?: string;
    phoneNumber?: string;
    propertyAddress: string;
    pinLength?: number;
    allowedChars?: string;
}

/**
 * A simplified version of the GCNotify error returned from the api
 */
export interface gcNotifyError {
    response: gcNotifyErrorResponse;
}

interface gcNotifyErrorResponse {
    data: gcNotifyErrorData;
    status: number;
    statusText: string;
}

interface gcNotifyErrorData {
    errors: gcNotifyErrorInfo[];
    status_code: number;
}

interface gcNotifyErrorInfo {
    error: string;
    message: string;
}

/**
 * The information needed to verify a pin from the VHERS side.
 * Note that the pids are seperated by a vertical bar (|)
 * @example
 * {
  		"pin": "ABCD1234",
  		"pids": "12345678|11234567"
	}
 */
export interface verifyPinRequestBody {
    pin: string;
    pids: string;
}

/**
 * The response given from a verify pin request.
 * If verified is false, the reason that the PIN was not verified is given.
 * @example
 * {
  	"verified": false,
  	"reason": {
 		"errorType": "NotFoundError",
  		"errorMessage": "PIN was unable to be verified"
  	}
   }
 */
export interface verifyPinResponse {
    verified: boolean;
    reason?: verifyPinErrorType;
}

interface verifyPinErrorType {
    errorType?: string;
    errorMessage: string;
}

/**
 * The response given when an api key is not provided in a request that requires it
 * @example {
	 "message": "Access Denied"
   }
 */
export interface UnauthorizedErrorResponse {
    message: string;
}

/**
* The response given when the api key provided in a request is invalid
* @example {
	"message": "Invalid Token"
  }
*/
export interface InvalidTokenErrorResponse {
    message: string;
}

/**
 * No active user found
 * @example {
 * 	 "message": "No active request found",
 *   "code": 204
 * }
 */
export interface noActiveUserFound {
    message: string;
    code: number;
}
/**
 * Response for user list
 * @example
 * {
    "userId": "82dc08e5-cbca-40c2-9d35-a4d1407d5f8d",
    "userGuid": "82dc08e5-cbca-40c2-9d35-a4d1407d5f8d",
    "identityType": "idir",
    "role": "Admin",
    "organization": "Bc Service",
    "email": "abc@gov.ca",
    "userName": "johndoe",
    "givenName": "John",
    "lastName": "Doe",
    "isActive": "true",
    "deactivationReason": "To get access to site",
  }
 */
export interface userList {
    userId: string;
    userGuid: string;
    identityType: string;
    role: UserRoles;
    organization: string;
    email: string;
    userName: string;
    givenName: string;
    lastName: string;
    isActive: boolean;
}
/**
* The error given when there already exists an access request for a user that has not yet been approved or rejected.
* @example {
	"message": "There already exists an access request for this user. Please contact your administrator."
  }
*/
export interface DuplicateRequestErrorType {
    message: string;
}
