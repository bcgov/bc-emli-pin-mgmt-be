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
    addressMatchScore,
    serviceBCCreateRequestBody,
} from '../helpers/types';
import PINGenerator from '../helpers/PINGenerator';
import logger from '../middleware/logger';
import { batchUpdatePin, deletePin, findPin } from '../db/ActivePIN.db';
import { EntityNotFoundError, Like, TypeORMError } from 'typeorm';
import { ActivePin } from '../entity/ActivePin';
import {
    pidStringSplitAndSort,
    sortActivePinResults,
} from '../helpers/pidHelpers';
import { NotFoundError } from '../helpers/NotFoundError';
import 'string_score';
import { BorderlineResultError } from '../helpers/BordelineResultError';
import { readFileSync } from 'fs';
import path from 'path';

@Route('pins')
export class PINController extends Controller {
    /**
     * Used to validate that a create pin request body has all the required fields.
     * @returns An array of 'faults' (validation errors), or an empty array if there are no errors
     */
    private pinRequestBodyValidate(
        requestBody: createPinRequestBody | serviceBCCreateRequestBody,
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
     * Used to import the JSON with the weights dynamically
     */
    private async dynamicImportCaller() {
        const json = JSON.parse(
            readFileSync(
                path.join(__dirname, '/../../matchWeightsThresholds.json'),
                'utf-8',
            ),
        );
        if (
            (json.thresholds as { [key: string]: number }) &&
            (json.weights as { [key: string]: number }) &&
            (json.fuzzinessCoefficients as { [key: string]: number }) &&
            (json.streetAddressLooseMatchReductionCoefficient as number)
        )
            return json;
        else throw new Error(`Missing required fields in import`);
    }

    /**
     * Used to score address comparisons,
     * either with an exact match if threshold === 1 or fuzzy match otherwise
     */
    private score(
        base: string | null,
        compare: string,
        threshold: number,
        fuzziness = 1,
    ): number {
        if (base === null) throw new Error(`Base string cannot be null.`);
        if (threshold > 1 || threshold < 0)
            throw new Error(
                'Invalid scoring threshold. Please provide thresholds between 0 and 1 inclusive.',
            );
        if (fuzziness && (!Number.isFinite(fuzziness) || fuzziness > 1))
            // we don't check for negative numbers because these technically work, they just provide very low scores
            throw new Error(
                'Invalid fuzziness coefficient. Please provide fuzziness coeffiecients less than or equal to 1.',
            );

        if (threshold === 1)
            // exact match
            return base.trim().toLowerCase() === compare.trim().toLowerCase()
                ? 1
                : 0;
        else {
            return base
                .trim()
                .toLowerCase()
                .score(compare.trim().toLowerCase(), fuzziness);
        }
    }

    /**
     * Used to validate that the result from the db matches the create request so that a pin can be created
     * @param requestBody The request body to validate against
     * @param pinResult The individual ActivePin result to validate against
     * @returns a
     */
    private async pinResultValidate(
        requestBody: createPinRequestBody,
        pinResult: ActivePin,
        ownerNumber: number,
    ): Promise<addressMatchScore | string[]> {
        // Fail if owner number doesn't match. This isn't a fuzzy match: it's exact
        if (requestBody.numberOfOwners !== ownerNumber) {
            throw new Error(
                'Number of owners does not match -- automatic fail.',
            );
        }

        // Check the fields in the result to see if the required ones for an automatic match are present
        const faults: string[] = [];
        if (
            pinResult.addressLine_1 === undefined ||
            pinResult.addressLine_1 === null ||
            pinResult.addressLine_1.trim().toUpperCase() ===
                'NO ADDRESS ON FILE FOR THIS OWNER'
        ) {
            faults.push(
                'No address is on file for this owner: please contact service BC to create or recreate your PIN',
            );
        }
        if (
            pinResult.lastName_1 === undefined ||
            pinResult.lastName_1 === null
        ) {
            faults.push(
                'No legal name or corporation name is on file for this owner: please contact service BC to create or recreate your PIN',
            );
        }
        if (
            (pinResult.city === undefined || pinResult.city === null) &&
            (pinResult.postalCode === undefined ||
                pinResult.postalCode === null)
        ) {
            faults.push(
                'No city or postal / zip code is on file for this owner: please contact service BC to create or recreate your PIN',
            );
        }
        if (faults.length > 0) {
            return faults;
        }

        // Do fuzzy matching on each field to determine a score
        const weightsAndThresholds = await this.dynamicImportCaller();
        const weights: { [key: string]: number } = weightsAndThresholds.weights;
        const thresholds: { [key: string]: number } =
            weightsAndThresholds.thresholds;
        const coefficients: { [key: string]: number } =
            weightsAndThresholds.fuzzinessCoefficients;
        let weightedAverage = 0,
            givenNameScore = NaN,
            lastNamesScore = NaN,
            incorporationNumberScore = NaN,
            streetAddressScore = NaN,
            cityScore = NaN,
            provinceAbbreviationScore = NaN,
            countryScore = NaN,
            postalCodeScore = NaN;

        // If given name is present, it isn't a corporation. These only have lastName_1 and sometimes lastName_2
        if (pinResult.givenName !== null && pinResult.givenName !== undefined) {
            if (
                requestBody.givenName === null ||
                requestBody.givenName === undefined
            )
                givenNameScore = 0; // nothing to match
            else {
                givenNameScore = this.score(
                    pinResult.givenName,
                    requestBody.givenName,
                    thresholds.givenNameThreshold,
                    coefficients.givenNameFuzzyCoefficient,
                );
                if (givenNameScore < thresholds.givenNameThreshold)
                    givenNameScore = 0; // no points below threshold
            }
        } else {
            // it's a corporation
            if (
                pinResult.incorporationNumber !== null &&
                pinResult.incorporationNumber !== undefined
            ) {
                if (
                    requestBody.incorporationNumber === null ||
                    requestBody.incorporationNumber === undefined
                ) {
                    incorporationNumberScore = 0;
                } else {
                    incorporationNumberScore = this.score(
                        pinResult.incorporationNumber,
                        requestBody.incorporationNumber,
                        thresholds.incorporationNumberThreshold,
                        coefficients.incorporationNumberFuzzyCoefficient,
                    );
                    if (
                        incorporationNumberScore <
                        thresholds.incorporationNumberThreshold
                    )
                        incorporationNumberScore = 0; // no points below threshold
                }
            }
        }

        // Match fields that should be present in both cases
        // Last name(s)
        let combinedRequestLastNames, combinedResultLastNames;
        combinedRequestLastNames = requestBody.lastName_1;
        if (
            requestBody.lastName_2 !== null &&
            requestBody.lastName_2 !== undefined
        )
            combinedRequestLastNames += ' ' + requestBody.lastName_2.trim();
        combinedResultLastNames = pinResult.lastName_1;
        if (pinResult.lastName_2 !== null && pinResult.lastName_2 !== undefined)
            combinedResultLastNames += ' ' + pinResult.lastName_2.trim();
        lastNamesScore = this.score(
            combinedResultLastNames,
            combinedRequestLastNames,
            thresholds.lastNamesThreshold,
            coefficients.lastNamesFuzzyCoefficient,
        );
        if (lastNamesScore < thresholds.lastNamesThreshold) lastNamesScore = 0; // no points below threshold

        /* Street address
		   This is special in that it is a loose match: 
		   we check the threshold to see if it should be assigned partial points, 
		   not if it should be assigned 0 points.
		   We wait until weights are adjusted to do this
		*/
        let combinedRequestAddress, combinedResultAddress;
        combinedRequestAddress = requestBody.addressLine_1;
        if (
            requestBody.addressLine_2 !== null &&
            requestBody.addressLine_2 !== undefined
        )
            combinedRequestAddress += ' ' + requestBody.addressLine_2.trim();
        combinedResultAddress = pinResult.addressLine_1;
        if (
            pinResult.addressLine_2 !== null &&
            pinResult.addressLine_2 !== undefined
        )
            combinedResultAddress += ' ' + pinResult.addressLine_2.trim();
        streetAddressScore = this.score(
            combinedResultAddress,
            combinedRequestAddress,
            thresholds.streetAddressThreshold,
            coefficients.streetAddressFuzzyCoefficient,
        );

        // City
        if (pinResult.city !== null && pinResult.city !== undefined) {
            if (requestBody.city === null || requestBody.city === undefined)
                cityScore = 0;
            else {
                cityScore = this.score(
                    pinResult.city,
                    requestBody.city,
                    thresholds.cityThreshold,
                    coefficients.cityFuzzyCoefficient,
                );
                if (cityScore < thresholds.cityThreshold) cityScore = 0; // no points below threshold
            }
        }

        // Province Abbreviation
        if (
            pinResult.provinceAbbreviation !== null &&
            pinResult.provinceAbbreviation !== undefined
        ) {
            if (
                requestBody.provinceAbbreviation === null ||
                requestBody.provinceAbbreviation === undefined
            )
                provinceAbbreviationScore = 0;
            else {
                provinceAbbreviationScore = this.score(
                    pinResult.provinceAbbreviation,
                    requestBody.provinceAbbreviation,
                    thresholds.provinceAbbreviationThreshold,
                    coefficients.provinceAbbreviationFuzzyCoefficient,
                );
                if (
                    provinceAbbreviationScore <
                    thresholds.provinceAbbreviationThreshold
                )
                    provinceAbbreviationScore = 0; // no points below threshold
            }
        }

        // Country
        if (pinResult.country !== null && pinResult.country !== undefined) {
            if (
                requestBody.country === null ||
                requestBody.country === undefined
            )
                countryScore = 0;
            else {
                countryScore = this.score(
                    pinResult.country,
                    requestBody.country,
                    thresholds.countryThreshold,
                    coefficients.countryFuzzyCoefficient,
                );
                if (countryScore < thresholds.countryThreshold)
                    countryScore = 0; // no points below threshold
            }
        }

        // Postal Code
        if (
            pinResult.postalCode !== null &&
            pinResult.postalCode !== undefined
        ) {
            if (
                requestBody.postalCode === null ||
                requestBody.postalCode === undefined
            )
                postalCodeScore = 0;
            else {
                postalCodeScore = this.score(
                    pinResult.postalCode.replace(/\s+/g, ''),
                    requestBody.postalCode.replace(/\s+/g, ''),
                    thresholds.postalCodeThreshold,
                    coefficients.postalCodeFuzzyCoefficient,
                );
                if (postalCodeScore < thresholds.postalCodeThreshold)
                    postalCodeScore = 0; // no points below threshold
            }
        }

        // Adjust weights if required
        let totalWeight =
            weights.lastNamesWeight +
            weights.ownerNumberWeight +
            weights.streetAddressWeight +
            weights.cityWeight +
            weights.provinceAbbreviationWeight +
            weights.countryWeight +
            weights.postalCodeWeight;

        // For single owners
        if (!Number.isNaN(givenNameScore)) {
            totalWeight += weights.givenNameWeight;
        } else {
            // For corporations
            totalWeight += weights.incorporationNumberWeight;
            if (Number.isNaN(incorporationNumberScore)) {
                // assign all inc # weight to company name instead
                weights.lastNamesWeight += weights.incorporationNumberWeight;
                weights.incorporationNumberWeight = 0;
            }
        }

        // Subtract missing weights from total
        if (Number.isNaN(cityScore)) {
            totalWeight -= weights.cityWeight;
            weights.cityWeight = 0;
        }
        if (Number.isNaN(provinceAbbreviationScore)) {
            totalWeight -= weights.provinceAbbreviationWeight;
            weights.provinceAbbreviationWeight = 0;
        }
        if (Number.isNaN(countryScore)) {
            totalWeight -= weights.countryWeight;
            weights.countryWeight = 0;
        }
        if (Number.isNaN(postalCodeScore)) {
            totalWeight -= weights.postalCodeWeight;
            weights.postalCodeWeight = 0;
        }

        // Reweight everything and calculate
        // eslint-disable-next-line prefer-const
        let result: any = {};
        let denominator = 0;

        const weightEntries = Object.entries(weights);
        for (const weight of weightEntries) {
            weights[weight[0]] = weight[1] / totalWeight;
            if (weight[0] === 'streetAddressWeight') {
                if (streetAddressScore < thresholds.streetAddressThreshold)
                    streetAddressScore =
                        streetAddressScore *
                        weight[1] *
                        weightsAndThresholds.streetAddressLooseMatchReductionCoefficient;
                // partial points below threshold
                else streetAddressScore = weights.streetAddressWeight;
            }
        }
        result = { ...result, streetAddressScore };
        denominator += weights.streetAddressWeight;
        result = { ...result, ownerNumberScore: weights.ownerNumberWeight };
        denominator += weights.ownerNumberWeight;
        if (lastNamesScore === 0) {
            result = { ...result, lastNamesScore };
        } else result = { ...result, lastNamesScore: weights.lastNamesWeight };
        denominator += weights.lastNamesWeight;

        if (!Number.isNaN(cityScore)) {
            if (cityScore === 0) {
                result = { ...result, cityScore };
            } else result = { ...result, cityScore: weights.cityWeight };
            denominator += weights.cityWeight;
        }
        if (!Number.isNaN(provinceAbbreviationScore)) {
            if (provinceAbbreviationScore === 0) {
                result = { ...result, provinceAbbreviationScore };
            } else
                result = {
                    ...result,
                    provinceAbbreviationScore:
                        weights.provinceAbbreviationWeight,
                };
            denominator += weights.provinceAbbreviationWeight;
        }
        if (!Number.isNaN(countryScore)) {
            if (countryScore === 0) {
                result = { ...result, countryScore };
            } else result = { ...result, countryScore: weights.countryWeight };
            denominator += weights.countryWeight;
        }
        if (!Number.isNaN(postalCodeScore)) {
            if (postalCodeScore === 0) {
                result = { ...result, postalCodeScore };
            } else
                result = {
                    ...result,
                    postalCodeScore: weights.postalCodeWeight,
                };
            denominator += weights.postalCodeWeight;
        }
        if (!Number.isNaN(givenNameScore)) {
            if (givenNameScore === 0) {
                result = { ...result, givenNameScore };
            } else
                result = { ...result, givenNameScore: weights.givenNameWeight };
            denominator += weights.givenNameWeight;
        }
        if (!Number.isNaN(incorporationNumberScore)) {
            if (incorporationNumberScore === 0) {
                result = { ...result, incorporationNumberScore };
            } else
                result = {
                    ...result,
                    incorporationNumberScore: weights.incorporationNumberWeight,
                };
            denominator += weights.incorporationNumberWeight;
        }

        const resultEntries: number[] = Object.values(result);
        for (const entry of resultEntries) weightedAverage += entry;
        weightedAverage = weightedAverage / denominator;
        result = { ...result, weightedAverage };
        logger.info(`Result score info below:`);
        logger.info(result);
        return result as addressMatchScore;
    }

    /**
     * Internal method for creating or recreating a PIN. The process is the same.
     */
    private async createOrRecreatePin(
        @Body() requestBody: createPinRequestBody,
    ): Promise<updatedPIN[]> {
        const gen: PINGenerator = new PINGenerator();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any[] = [];

        // Validate that the input request is correct
        const faults = this.pinRequestBodyValidate(requestBody);
        if (faults.length > 0) {
            throw new AggregateError(
                faults,
                'Validation Error(s) occured in createPin request body:',
            );
        }

        // Grab input pid(s)
        const pids: string[] = pidStringSplitAndSort(requestBody.pids);
        let where;
        if (pids.length === 1) {
            where = { pids: Like(`%` + pids[0] + `%`) };
        } else {
            where = [];
            for (let i = 0; i < pids.length; i++) {
                where.push({ pids: Like(`%` + pids[i] + `%`) });
            }
        }

        // Find Active PIN entry (or entries if more than one pid to insert or update
        let pinResults = await findPin(undefined, where);
        pinResults = sortActivePinResults(pinResults);

        const updateResults = [];
        const borderlineResults = [];
        const thresholds = (await this.dynamicImportCaller()).thresholds;
        const pinResultKeys = Object.keys(pinResults);

        if (pinResultKeys.length > 0) {
            for (const key of pinResultKeys) {
                const titleOwners = pinResults[key].length;
                for (let i = 0; i < titleOwners; i++) {
                    let matchScore: addressMatchScore | string[];
                    try {
                        matchScore = await this.pinResultValidate(
                            requestBody,
                            pinResults[key][i],
                            titleOwners,
                        );
                        if (!('weightedAverage' in matchScore)) {
                            // it's a string array
                            continue; // bad match, skip
                        }
                    } catch (err) {
                        if (err instanceof Error) logger.error(err.message);
                        continue; // skip this entry
                    }
                    if (
                        matchScore.weightedAverage >=
                        thresholds.overallThreshold
                    ) {
                        updateResults.push({
                            ActivePin: pinResults[key][i],
                            matchScore,
                        });
                    } else if (
                        matchScore.weightedAverage >=
                        thresholds.borderlineThreshold
                    ) {
                        borderlineResults.push({
                            ActivePin: pinResults[key][i],
                            matchScore,
                        });
                    }
                }
            }
            updateResults.sort(
                (a, b) =>
                    b.matchScore.weightedAverage - a.matchScore.weightedAverage,
            );
            borderlineResults.sort(
                (a, b) =>
                    b.matchScore.weightedAverage - a.matchScore.weightedAverage,
            );
        }

        if (updateResults.length <= 0 && borderlineResults.length <= 0) {
            let errMessage = `Pids ${requestBody.pids} does not match the address and name / incorporation number given:\n`;
            let newLineFlag = false;
            // Line 1
            if (requestBody.givenName)
                errMessage += `${requestBody.givenName} `;
            errMessage += `${requestBody.lastName_1} `;
            if (requestBody.lastName_2)
                errMessage += `${requestBody.lastName_2} `;
            if (requestBody.incorporationNumber)
                errMessage += `Inc. # ${requestBody.incorporationNumber}`;
            // Line 2
            if (requestBody.addressLine_1)
                errMessage += `\n${requestBody.addressLine_1}`;
            // Line 3
            if (requestBody.addressLine_2)
                errMessage += `\n${requestBody.addressLine_2}`;
            // Line 4
            if (requestBody.city) {
                newLineFlag = true;
                errMessage += `\n${requestBody.city}`;
            }
            if (requestBody.provinceAbbreviation) {
                if (!newLineFlag) {
                    newLineFlag = true;
                    errMessage += `\n${requestBody.provinceAbbreviation}`;
                } else {
                    errMessage += `, ${requestBody.provinceAbbreviation}`;
                }
            }
            if (requestBody.country) {
                if (!newLineFlag) {
                    newLineFlag = true;
                    errMessage += `\n${requestBody.country}`;
                } else {
                    errMessage += `, ${requestBody.country}`;
                }
            }
            if (requestBody.postalCode) {
                if (!newLineFlag) errMessage += `\n${requestBody.postalCode}`;
                else errMessage += ` ${requestBody.postalCode}`;
            }
            throw new NotFoundError(errMessage);
        } else if (updateResults.length <= 0 && borderlineResults.length > 0) {
            // Give an error message related to the closest result
            let errMessage = `Close result: consider checking your `;
            if (
                borderlineResults[0].matchScore.streetAddressScore <
                thresholds.streetAddressThreshold
            ) {
                errMessage += `address`;
            } else if (
                borderlineResults[0].matchScore.postalCodeScore &&
                borderlineResults[0].matchScore.postalCodeScore <
                    thresholds.postalCodeThreshold
            ) {
                errMessage += `postal code`;
            } else if (
                borderlineResults[0].matchScore.incorporationNumberScore &&
                borderlineResults[0].matchScore.incorporationNumberScore <
                    thresholds.incorporationNumberThreshold
            ) {
                errMessage += `incorporation number`;
            } else {
                errMessage += `name`; // we're not going to tell them about things that barely affect
                // the score like country or province, and if they got the number of owners
                // wrong since that is easily guessable
            }
            throw new BorderlineResultError(errMessage);
        }

        // Generate pin and add to result
        const pin = await gen.create(
            requestBody.pinLength,
            requestBody.allowedChars,
        );
        const resultToUpdate = updateResults[0].ActivePin; // this will be the one with the highest match score
        resultToUpdate.pin = pin.pin;
        const emailPhone: emailPhone = {
            email: requestBody.email,
            phoneNumber: requestBody.phoneNumber,
        };

        // Insert into DB
        const errors = await batchUpdatePin(
            [resultToUpdate],
            emailPhone,
            requestBody.requesterUsername, // TODO: Get info from token
        );
        if (errors.length >= 1) {
            throw new AggregateError(
                errors,
                `Error(s) occured in batchUpdatePin: `,
            );
        }

        // Prepare and return result
        if (resultToUpdate.pin) {
            const toPush: updatedPIN = {
                pin: resultToUpdate.pin, // TODO: Hide form non-SuperAdmin once GCNotify is integrated
                pids: resultToUpdate.pids,
                livePinId: resultToUpdate.livePinId,
            };
            result.push(toPush);
        }
        // TODO: Add GCNotify to send the email / text
        return result;
    }

    /**
     * Internal method for creating or recreating with external validation.
     */
    private async createOrRecreatePinServiceBC(
        requestBody: serviceBCCreateRequestBody,
    ): Promise<updatedPIN[]> {
        const result: any[] = [];

        // Validate that the input request has the correct email / phone information
        const faults = this.pinRequestBodyValidate(requestBody);
        if (faults.length > 0) {
            throw new AggregateError(
                faults,
                'Validation Error(s) occured in createPin request body:',
            );
        }

        // Find the pin to update
        const pinResult = await findPin(undefined, {
            livePinId: requestBody.livePinId,
        });
        if (pinResult.length < 1) {
            throw new NotFoundError(
                `Active Pin with livePinId ${requestBody.livePinId} not found in database.`,
            );
        }

        // Generate the new pin
        const gen: PINGenerator = new PINGenerator();
        const pin = await gen.create(
            requestBody.pinLength,
            requestBody.allowedChars,
        );
        pinResult[0].pin = pin.pin;

        // Insert into DB
        const emailPhone: emailPhone = {
            email: requestBody.email,
            phoneNumber: requestBody.phoneNumber,
        };
        const errors = await batchUpdatePin(
            [pinResult[0]],
            emailPhone,
            requestBody.requesterUsername, // TODO: Get info from token
        );
        if (errors.length >= 1) {
            throw new AggregateError(
                errors,
                `Error(s) occured in batchUpdatePin: `,
            );
        }

        // Prepare and return results
        const toPush: updatedPIN = {
            pin: pinResult[0].pin, // TODO: Hide form non-SuperAdmin once GCNotify is integrated
            pids: pinResult[0].pids,
            livePinId: pinResult[0].livePinId,
        };
        result.push(toPush);
        // TODO: Add GCNotify to send the email / text
        return result;
    }

    /**
     * Used to create a single, unique PIN, checking against the DB to do so.
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
    @Post('vhers-create')
    public async createPin(
        @Res() rangeErrorResponse: TsoaResponse<422, pinRangeErrorType>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Res()
        aggregateErrorResponse: TsoaResponse<422, aggregateValidationErrorType>,
        @Res()
        notFoundErrorResponse: TsoaResponse<422, EntityNotFoundErrorType>,
        @Body() requestBody: createPinRequestBody,
    ): Promise<updatedPIN[]> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let res: any[] = [];
        try {
            res = await this.createOrRecreatePin(requestBody);
        } catch (err) {
            if (
                err instanceof NotFoundError ||
                err instanceof BorderlineResultError
            ) {
                logger.warn(
                    `Encountered not found error in createPin: ${err.message}`,
                );
                return notFoundErrorResponse(422, {
                    message: err.message,
                } as EntityNotFoundErrorType);
            }
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
        return res;
    }

    /**
     * Used to recreate a single, unique PIN, checking against the DB to do so.
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
    @Post('vhers-regenerate')
    public async recreatePin(
        @Res() rangeErrorResponse: TsoaResponse<422, pinRangeErrorType>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Res()
        aggregateErrorResponse: TsoaResponse<422, aggregateValidationErrorType>,
        @Res()
        notFoundErrorResponse: TsoaResponse<422, EntityNotFoundErrorType>,
        @Body() requestBody: createPinRequestBody,
    ): Promise<updatedPIN[]> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let res: any[] = [];
        try {
            res = await this.createOrRecreatePin(requestBody);
        } catch (err) {
            if (
                err instanceof NotFoundError ||
                err instanceof BorderlineResultError
            ) {
                logger.warn(
                    `Encountered not found error in createPin: ${err.message}`,
                );
                return notFoundErrorResponse(422, {
                    message: err.message,
                } as EntityNotFoundErrorType);
            }
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
        return res;
    }

    /**
     * Used to create a single, unique PIN, checking against the DB to do so.
     * This endpoint has minimal validation, as the validation is expected to be performed by a human.
     * Expected error codes and messages:
     * - `422`
     * -- `PIN must be of length 1 or greater`
     * -- `Too many PIN creation attempts: consider expanding your pin length or character set to allow more unique PINs.`
     * -- `Error(s) occured in batchUpdatePin: []`
     * - `500`
     *  -- `Internal Server Error`
     * @param The request body. See 'serviceBCCreateRequestPinBody' in schemas for more details.
     * @returns An object containing the unique PIN
     */
    @Post('create')
    public async serviceBCCreatePin(
        @Res() rangeErrorResponse: TsoaResponse<422, pinRangeErrorType>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Res()
        aggregateErrorResponse: TsoaResponse<422, aggregateValidationErrorType>,
        @Res()
        notFoundErrorResponse: TsoaResponse<422, EntityNotFoundErrorType>,
        @Body() requestBody: serviceBCCreateRequestBody,
    ): Promise<updatedPIN[]> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let res: any[] = [];
        try {
            res = await this.createOrRecreatePinServiceBC(requestBody);
        } catch (err) {
            if (
                err instanceof NotFoundError ||
                err instanceof BorderlineResultError
            ) {
                logger.warn(
                    `Encountered not found error in createPin: ${err.message}`,
                );
                return notFoundErrorResponse(422, {
                    message: err.message,
                } as EntityNotFoundErrorType);
            }
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
        return res;
    }

    /**
     * Used to recreate a single, unique PIN, checking against the DB to do so.
     * This endpoint has minimal validation, as the validation is expected to be performed by a human.
     * Expected error codes and messages:
     * - `422`
     * -- `PIN must be of length 1 or greater`
     * -- `Too many PIN creation attempts: consider expanding your pin length or character set to allow more unique PINs.`
     * -- `Error(s) occured in batchUpdatePin: []`
     * - `500`
     *  -- `Internal Server Error`
     * @param The request body. See 'serviceBCCreateRequestPinBody' in schemas for more details.
     * @returns An object containing the unique PIN
     */
    @Post('regenerate')
    public async serviceBCRecreatePin(
        @Res() rangeErrorResponse: TsoaResponse<422, pinRangeErrorType>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Res()
        aggregateErrorResponse: TsoaResponse<422, aggregateValidationErrorType>,
        @Res()
        notFoundErrorResponse: TsoaResponse<422, EntityNotFoundErrorType>,
        @Body() requestBody: serviceBCCreateRequestBody,
    ): Promise<updatedPIN[]> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let res: any[] = [];
        try {
            res = await this.createOrRecreatePinServiceBC(requestBody);
        } catch (err) {
            if (
                err instanceof NotFoundError ||
                err instanceof BorderlineResultError
            ) {
                logger.warn(
                    `Encountered not found error in createPin: ${err.message}`,
                );
                return notFoundErrorResponse(422, {
                    message: err.message,
                } as EntityNotFoundErrorType);
            }
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
        return res;
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
     * @param requestBody The body of the request. Note that expiredByUsername is only required for reasons other than "CO" (change of ownership).
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
        const expiredUsername =
            requestBody.expirationReason === expirationReason.ChangeOfOwnership
                ? 'dataimportjob'
                : requestBody.expiredByUsername
                ? requestBody.expiredByUsername
                : '';
        if (expiredUsername === '') {
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
                    `Encountered unknown Internal Server Error in expirePin: ${err}`,
                );
                return serverErrorResponse(500, { message: err.message });
            }
        }
        return deletedPin;
    }
}
