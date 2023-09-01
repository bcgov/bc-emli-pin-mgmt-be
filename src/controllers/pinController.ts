// eslint-disable spaced-comment
import {
    Get,
    Post,
    Route,
    Controller,
    Query,
    TsoaResponse,
    Res,
    Body,
} from 'tsoa';
import {
    PINDictionary,
    PINObject,
    pinRangeErrorType,
    serverErrorType,
    expirationReason,
    GenericTypeORMErrorType,
    EntityNotFoundErrorType,
    requiredFieldErrorType,
    expireRequestBody,
    createPinRequestBody,
    aggregateValidationErrorType,
    emailPhone,
    updatedPIN,
} from '../helpers/types';
import PINGenerator from '../helpers/PINGenerator';
import logger from '../middleware/logger';
import { batchUpdatePin, deletePin, findPin } from '../db/ActivePIN.db';
import { EntityNotFoundError, TypeORMError } from 'typeorm';
import { ActivePin } from '../entity/ActivePin';
import { pidStringToNumber } from '../helpers/pidStringToNumber';

@Route('pins')
export class PINController extends Controller {
    /**
     * Used to validate that a create pin request body has all the required fields.
     * @returns An array of 'faults' (validation errors), or an empty array if there are no errors
     */
    private pinRequestBodyValidate(
        requestBody: createPinRequestBody,
    ): string[] {
        const faults: string[] = [];
        // Phone / email checks
        if (!requestBody.phoneNumber && !requestBody.email) {
            faults.push('Phone number OR email required');
        }
        if (
            requestBody.phoneNumber &&
            !(
                (requestBody.phoneNumber.startsWith('+1') &&
                    requestBody.phoneNumber.length === 12) ||
                (requestBody.phoneNumber.startsWith('1') &&
                    requestBody.phoneNumber.length === 11)
            )
        ) {
            faults.push(
                'Phone number must be a valid, 10 digit North American phone number prefixed with 1 or +1',
            );
        }
        return faults;
    }

    /**
     * Used to validate that the result from the db matches the create request so that a pin can be created
     * TODO: Change this to a fuzzy match with scoring
     * (will have to search by pid(s), narrow down by close or exact name match & validate
     * against a canonical form). This will be time consuming...
     * @param requestBody The request body to validate against
     * @param pinResult The individual ActivePin result to validate against
     * @returns true if valid, false otherwise
     */
    private pinResultValidate(
        requestBody: createPinRequestBody,
        pinResult: ActivePin,
    ): boolean {
        // Optional fields
        if (
            (requestBody.givenName &&
                (!pinResult.givenName ||
                    requestBody.givenName !== pinResult.givenName)) ||
            (pinResult.givenName && !requestBody.givenName)
        ) {
            return false; // last name 2 provided in one but not the other, or doesn't match
        }
        if (
            (requestBody.lastName_1 &&
                (!pinResult.lastName_1 ||
                    requestBody.lastName_1 !== pinResult.lastName_1)) ||
            (pinResult.lastName_1 && !requestBody.lastName_1)
        ) {
            return false; // last name 2 provided in one but not the other, or doesn't match
        }
        if (
            (requestBody.lastName_2 &&
                (!pinResult.lastName_2 ||
                    requestBody.lastName_2 !== pinResult.lastName_2)) ||
            (pinResult.lastName_2 && !requestBody.lastName_2)
        ) {
            return false; // last name 2 provided in one but not the other, or doesn't match
        }
        if (
            (requestBody.incorporationNumber &&
                (!pinResult.incorporationNumber ||
                    requestBody.incorporationNumber !==
                        pinResult.incorporationNumber)) ||
            (pinResult.incorporationNumber && !requestBody.incorporationNumber)
        ) {
            return false; // last name 2 provided in one but not the other, or doesn't match
        }
        if (
            (requestBody.addressLine_1 &&
                (!pinResult.addressLine_1 ||
                    requestBody.addressLine_1 !== pinResult.addressLine_1)) ||
            (pinResult.addressLine_1 && !requestBody.addressLine_1)
        ) {
            return false; // address line 2 provided in one but not the other, or doesn't match
        }
        if (
            (requestBody.addressLine_2 &&
                (!pinResult.addressLine_2 ||
                    requestBody.addressLine_2 !== pinResult.addressLine_2)) ||
            (pinResult.addressLine_2 && !requestBody.addressLine_2)
        ) {
            return false; // address line 2 provided in one but not the other, or doesn't match
        }
        if (
            (requestBody.provinceAbbreviation &&
                (!pinResult.province ||
                    requestBody.provinceAbbreviation !== pinResult.province)) ||
            (pinResult.province && !requestBody.provinceAbbreviation)
        ) {
            return false; // province provided in one but not the other, or doesn't match
        }
        if (
            (requestBody.provinceLong &&
                (!pinResult.otherGeographicDivision ||
                    requestBody.provinceLong !==
                        pinResult.otherGeographicDivision)) ||
            (pinResult.otherGeographicDivision && !requestBody.provinceLong)
        ) {
            return false; // other geographic division provided in one but not the other, or doesn't match
        }
        if (
            (requestBody.country &&
                (!pinResult.country ||
                    requestBody.country !== pinResult.country)) ||
            (pinResult.country && !requestBody.country)
        ) {
            return false; // postal code provided in one but not the other, or doesn't match
        }
        if (
            (requestBody.postalCode &&
                (!pinResult.postalCode ||
                    requestBody.postalCode !== pinResult.postalCode)) ||
            (pinResult.postalCode && !requestBody.postalCode)
        ) {
            return false; // postal code provided in one but not the other, or doesn't match
        }
        return true;
    }

    /**
     * Used to create or recreate a single, unique PIN, checking against the DB to do so.
     * Expected error codes and messages:
     * - `422`
     * -- `PIN must be of length 1 or greater`
     * -- `Too many PIN creation attempts: consider expanding your pin length or character set to allow more unique PINs.`
     * -- `Error(s) occured in batchUpdatePin: []`
     * - `500`
     *  -- `Internal Server Error`
     * @param The request body. See 'createRequestPinBody' in schemas for more details.
     * @returns An object containing the unique PIN
     */
    @Post('create')
    public async createPin(
        @Res() rangeErrorResponse: TsoaResponse<422, pinRangeErrorType>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Res()
        aggregateErrorResponse: TsoaResponse<422, aggregateValidationErrorType>,
        @Res()
        notFoundErrorResponse: TsoaResponse<422, EntityNotFoundErrorType>,
        @Body() requestBody: createPinRequestBody,
    ): Promise<updatedPIN[]> {
        const gen: PINGenerator = new PINGenerator();
        let pin;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any[] = [];

        try {
            // Validate that the input request is correct
            const faults = this.pinRequestBodyValidate(requestBody);
            if (faults.length > 0) {
                throw new AggregateError(
                    faults,
                    'Validation Error(s) occured in createPin request body:',
                );
            }

            // Grab input pid(s)
            const pids: number[] | number = pidStringToNumber(requestBody.pid);
            let where;
            if (typeof pids === 'number') {
                // singular number
                where = { pid: pids };
            } else {
                // an array
                where = [];
                for (const p of pids) {
                    where.push({ pid: p });
                }
            }

            // Find Active PIN entry (or entries if more than one pid to insert or update
            const pinResults = await findPin(undefined, where);

            const updateResults: ActivePin[] = [];
            const updateTitleNumbers = new Set();
            for (const result of pinResults) {
                // TODO: fuzzy match rather than exact match ActivePins to update
                const isMatch = this.pinResultValidate(requestBody, result);
                if (isMatch) {
                    updateTitleNumbers.add(result.titleNumber); // add to set of title numbers to generate a pin for
                    updateResults.push(result);
                }
            }

            if (updateResults.length <= 0) {
                let errMessage = `Pid ${requestBody.pid} does not match the address and name / incorporation number given:\n`;
                if (requestBody.givenName && requestBody.lastName_1)
                    errMessage =
                        errMessage +
                        `${requestBody.givenName} ${requestBody.lastName_1} ${
                            requestBody.lastName_2 ? requestBody.lastName_2 : ''
                        }`;
                else
                    errMessage =
                        errMessage +
                        `Inc. # ${requestBody.incorporationNumber}`;
                errMessage = errMessage + `\n${requestBody.addressLine_1}`;
                if (requestBody.addressLine_2) {
                    errMessage = errMessage + `\n${requestBody.addressLine_2}`;
                }
                errMessage = errMessage + `\n${requestBody.city}, `;
                if (requestBody.provinceAbbreviation)
                    errMessage =
                        errMessage + `${requestBody.provinceAbbreviation}, `;
                if (requestBody.provinceLong)
                    errMessage = errMessage + `${requestBody.provinceLong}, `;
                errMessage = errMessage + `${requestBody.country} `;
                if (requestBody.postalCode)
                    errMessage = errMessage + `${requestBody.postalCode}`;
                logger.warn(
                    `Encountered not found error in createPin: ${errMessage}`,
                );
                return notFoundErrorResponse(422, {
                    message: errMessage,
                } as EntityNotFoundErrorType);
            }

            // Generate Pin(s) and add to results
            const pinArray = [];
            for (const number of updateTitleNumbers) {
                pin = await gen.create(
                    requestBody.pinLength,
                    requestBody.allowedChars,
                ); // we only need one pin for multiple pids on the same title
                pinArray.push({ titleNumber: number, pin: pin.pin });
            }
            for (const result of updateResults) {
                for (const pin of pinArray) {
                    if (result.titleNumber === pin.titleNumber) {
                        result.pin = pin.pin;
                        break;
                    }
                }
            }
            const emailPhone: emailPhone = {
                email: requestBody.email,
                phoneNumber: requestBody.phoneNumber,
            };

            // Insert into DB
            const errors = await batchUpdatePin(
                updateResults,
                emailPhone,
                requestBody.requesterName,
                requestBody.requesterUsername,
            );
            if (errors.length >= 1) {
                throw new AggregateError(
                    errors,
                    `Error(s) occured in batchUpdatePin: `,
                );
            }

            // Prepare and return results
            for (const res of updateResults) {
                if (res.pin) {
                    const toPush: updatedPIN = {
                        pin: res.pin,
                        pid: res.pid,
                        livePinId: res.livePinId,
                    };
                    result.push(toPush);
                }
            }
            // TODO: Add GCNotify to send the email / text
        } catch (err) {
            if (err instanceof AggregateError) {
                logger.warn(`${err.message} ${err.errors}`);
                return aggregateErrorResponse(422, {
                    message: err.message,
                    faults: err.errors,
                });
            }
            if (err instanceof RangeError) {
                logger.warn(
                    `Encountered Range Error in createPin: ${err.message}`,
                );
                return rangeErrorResponse(422, {
                    message: err.message,
                } as pinRangeErrorType);
            } else if (err instanceof Error) {
                logger.warn(
                    `Encountered unknown Internal Server Error in createPin: ${err.message}`,
                );
                return serverErrorResponse(500, { message: err.message });
            }
        }
        return result;
    }

    /**
     * Used for the initial creation of PINs, when none exist in the database yet.
     * Expected error codes and messages:
     * - `422`
     * 	-- `PIN must be of length 1 or greater`
     * 	-- `Quantity of PINs requested too high: guaranteed repeats for the given pin length and character set.`
     * 	-- `The number of PINS created must be greater than 0.`
     * - `500`
     * 	-- `Internal Server Error`
     * @param quantity The quantity of PINs you wish to create.
     * @param pinLength The length of each PIN. Defaults to 8 characters.
     * @param allowedChars A string (not regex) of the characters to be used to
     * generate the pin. Default is A-Z excluding O, and 1-9
     * @returns An object containing an array of the created, unique PINs
     */
    @Get('initial-create')
    public async getInitialPins(
        @Res() rangeErrorResponse: TsoaResponse<422, pinRangeErrorType>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Query() quantity: number,
        @Query() pinLength?: number,
        @Query() allowedChars?: string,
    ): Promise<PINObject> {
        const gen: PINGenerator = new PINGenerator();
        const PINObject: PINObject = { pins: [] };

        try {
            const generatedPINS: PINDictionary = await gen.initialCreate(
                quantity,
                pinLength,
                allowedChars,
            );
            PINObject.pins = Object.keys(generatedPINS);
        } catch (err) {
            if (err instanceof RangeError) {
                logger.warn(
                    `Encountered Range Error in getInitialPins: ${err.message}`,
                );
                return rangeErrorResponse(422, {
                    message: err.message,
                } as pinRangeErrorType);
            } else if (err instanceof Error) {
                logger.warn(
                    `Encountered unknown Internal Server Error in getInitialPins: ${err.message}`,
                );
                return serverErrorResponse(500, { message: err.message });
            }
        }
        return PINObject;
    }

    /**
     * Used for expiring pins by their id (livePinId). Requires a reason for expiration, and if not a change of ownership, the name and username of who is expiring the pin.
     * Expected error codes and messages:
     * - `422`
     * 	-- `Could not find any entity of type "ActivePin" matching: {\n    "livePinId": "id here"\n}`
     * 	-- `Must provide an expiration name when expiring a PIN`
     * 	-- `Must provide an expiration username when expiring a PIN`
     * - `500`
     * 	-- `Internal Server Error`
     * @param requestBody The body of the request. Note that expiredByName and username are only required for reasons other than "CO" (change of ownership).
     * @returns The deleted pin
     */
    @Post('expire')
    public async expirePin(
        @Res() entityErrorResponse: TsoaResponse<422, EntityNotFoundErrorType>,
        @Res() typeORMErrorResponse: TsoaResponse<422, GenericTypeORMErrorType>,
        @Res()
        requiredFieldErrorResponse: TsoaResponse<422, requiredFieldErrorType>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Body() requestBody: expireRequestBody,
    ): Promise<ActivePin | undefined> {
        // If expired by LTSA data feed, username and name should be defaulted
        const expiredName =
            requestBody.expirationReason === expirationReason.ChangeOfOwnership
                ? 'LTSA Data Import'
                : requestBody.expiredByName
                ? requestBody.expiredByName
                : '';
        const expiredUsername =
            requestBody.expirationReason === expirationReason.ChangeOfOwnership
                ? 'dataimportjob'
                : requestBody.expiredByUsername
                ? requestBody.expiredByUsername
                : '';
        if (expiredName === '') {
            const message =
                'Must provide an expiration name when expiring a PIN';
            logger.warn(message);
            return requiredFieldErrorResponse(422, { message });
        } else if (expiredUsername === '') {
            const message =
                'Must provide an expiration username when expiring a PIN';
            logger.warn(message);
            return requiredFieldErrorResponse(422, { message });
        }
        let deletedPin: ActivePin | undefined;
        try {
            deletedPin = await deletePin(
                requestBody.livePinId,
                requestBody.expirationReason,
                expiredName,
                expiredUsername,
            );
        } catch (err) {
            if (err instanceof EntityNotFoundError) {
                logger.warn(
                    `Encountered Entity Not Found Error in expirePin: ${err.message}`,
                );
                return entityErrorResponse(422, { message: err.message });
            } else if (err instanceof TypeORMError) {
                logger.warn(
                    `Encountered TypeORM Error in expirePin: ${err.message}`,
                );
                return typeORMErrorResponse(422, { message: err.message });
            } else if (err instanceof Error) {
                logger.warn(
                    `Encountered unknown Internal Server Error in expirePin: ${err.message}`,
                );
                return serverErrorResponse(500, { message: err.message });
            }
        }
        return deletedPin;
    }
}
