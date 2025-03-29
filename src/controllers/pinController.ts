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
    Security,
    Middlewares,
    Request,
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
    verifyPinRequestBody,
    verifyPinResponse,
    UnauthorizedErrorResponse,
    InvalidTokenErrorResponse,
    forbiddenError,
    addressScoreResults,
} from '../helpers/types';
import PINGenerator from '../helpers/PINGenerator';
import logger from '../middleware/logger';
import {
    batchUpdatePin,
    deletePin,
    findPin,
    singleUpdatePin,
} from '../db/ActivePIN.db';
import { EntityNotFoundError, Like, TypeORMError } from 'typeorm';
import { ActivePin } from '../entity/ActivePin';
import {
    pidStringSplitAndSort,
    sortActivePinResults,
} from '../helpers/pidHelpers';
import { NotFoundError } from '../helpers/NotFoundError';
import 'string_score';
import { BorderlineResultError } from '../helpers/BorderlineResultError';
import { readFileSync } from 'fs';
import path from 'path';
import { Request as req } from 'express';
import { NonMatchingPidError } from '../helpers/NonMatchingPidError';
import { authenticate } from '../middleware/authentication';
import { AuthenticationError } from '../middleware/AuthenticationError';
import { decodingJWT } from '../helpers/auth';
import { RequiredFieldError } from '../helpers/RequiredFieldError';

@Route('pins')
export class PINController extends Controller {
    private weightsAndThresholds: any;
    constructor() {
        super();
        this.weightsAndThresholds = this.dynamicImportCaller();
    }
    /**
     * Used to validate that a create pin request body has all the required fields.
     * @returns An array of 'faults' (validation errors), or an empty array if there are no errors
     */
    public pinRequestBodyValidate(
        requestBody:
            | createPinRequestBody
            | serviceBCCreateRequestBody
            | expireRequestBody,
    ): string[] {
        const faults: string[] = [];
        // Phone / email checks
        if (!requestBody.phoneNumber && !requestBody.email) {
            faults.push('Phone number OR email required');
        }
        if (requestBody.phoneNumber) {
            if (
                !(
                    (requestBody.phoneNumber?.startsWith('+1') &&
                        requestBody.phoneNumber?.length === 12) ||
                    (requestBody.phoneNumber?.startsWith('1') &&
                        requestBody.phoneNumber?.length === 11)
                )
            ) {
                faults.push(
                    'Phone number must be a valid, 10 digit North American phone number prefixed with 1 or +1',
                );
            }
        }
        return faults;
    }

    /**
     * Used to import the JSON with the weights dynamically
     */
    private dynamicImportCaller() {
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
        ) {
            const errors = this.checkImportValueValidity(json);
            if (errors.length > 0) {
                throw new AggregateError(errors);
            }
            return json;
        } else throw new Error(`Missing required fields in import`);
    }

    /**
     * Used to do guard checks on input scoring parameters that should remain the same
     * This reduces the load on the API
     */
    private checkImportValueValidity(
        importThresholdsAndFuzziness: any,
    ): string[] {
        const thresholds: [string, number][] = Object.entries(
            importThresholdsAndFuzziness.thresholds,
        );
        const fuzzy: [string, number][] = Object.entries(
            importThresholdsAndFuzziness.fuzzinessCoefficients,
        );
        const errors: string[] = [];
        for (const threshold of thresholds) {
            if (threshold[1] > 1 || threshold[1] < 0)
                errors.push(
                    `Invalid scoring threshold "${threshold[0]}". Please provide thresholds between 0 and 1 inclusive.`,
                );
        }
        for (const fuzziness of fuzzy) {
            if (
                fuzziness[1] &&
                (!Number.isFinite(fuzziness[1]) || fuzziness[1] > 1)
            )
                // we don't check for negative numbers because these technically work, they just provide very low scores
                errors.push(
                    `Invalid fuzziness coefficient "${fuzziness[0]}". Please provide fuzziness coeffiecients less than or equal to 1.`,
                );
        }
        return errors;
    }

    /**
     * Used to score address comparisons,
     * either with an exact match if threshold === 1 or fuzzy match otherwise
     */
    private score(
        base: string,
        compare: string,
        threshold: number,
        fuzziness = 1,
    ): number {
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
     */
    private async pinResultValidate(
        requestBody: createPinRequestBody,
        pinResult: ActivePin,
        ownerNumber: number,
        weightsAndThresholds: any,
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
            pinResult.addressLine_1 === '' ||
            pinResult.addressLine_1.trim().toUpperCase() ===
                'NO ADDRESS ON FILE FOR THIS OWNER'
        ) {
            faults.push(
                'No address is on file for this owner: please contact service BC to create or recreate your PIN',
            );
        }
        if (
            pinResult.lastName_1 === undefined ||
            pinResult.lastName_1 === null ||
            pinResult.lastName_1 === ''
        ) {
            faults.push(
                'No legal name or corporation name is on file for this owner: please contact service BC to create or recreate your PIN',
            );
        }
        if (
            (pinResult.city === undefined ||
                pinResult.city === null ||
                pinResult.city === '') &&
            (pinResult.postalCode === undefined ||
                pinResult.postalCode === null ||
                pinResult.postalCode === '')
        ) {
            faults.push(
                'No city or postal / zip code is on file for this owner: please contact service BC to create or recreate your PIN',
            );
        }
        if (faults.length > 0) {
            return faults;
        }

        // Do fuzzy matching on each field to determine a score
        const weights: { [key: string]: number } = {
            givenNameWeight: weightsAndThresholds.weights.givenNameWeight,
            lastNamesWeight: weightsAndThresholds.weights.lastNamesWeight,
            incorporationNumberWeight:
                weightsAndThresholds.weights.incorporationNumberWeight,
            ownerNumberWeight: weightsAndThresholds.weights.ownerNumberWeight,
            streetAddressWeight:
                weightsAndThresholds.weights.streetAddressWeight,
            cityWeight: weightsAndThresholds.weights.cityWeight,
            provinceAbbreviationWeight:
                weightsAndThresholds.weights.provinceAbbreviationWeight,
            countryWeight: weightsAndThresholds.weights.countryWeight,
            postalCodeWeight: weightsAndThresholds.weights.postalCodeWeight,
        };
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
        if (
            pinResult.givenName !== null &&
            pinResult.givenName !== undefined &&
            pinResult.givenName !== ''
        ) {
            if (
                requestBody.givenName === null ||
                requestBody.givenName === undefined
            )
                givenNameScore = 0; // nothing to match
            else {
                requestBody.givenName = requestBody.givenName.replace(
                    /'/g,
                    '`',
                );
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
                pinResult.incorporationNumber !== undefined &&
                pinResult.incorporationNumber !== ''
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
        if (
            pinResult.lastName_2 !== null &&
            pinResult.lastName_2 !== undefined &&
            pinResult.lastName_2 !== ''
        )
            combinedResultLastNames += ' ' + pinResult.lastName_2.trim();

        combinedRequestLastNames = combinedRequestLastNames.replace(/'/g, '`');
        lastNamesScore = this.score(
            combinedResultLastNames as string,
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
            pinResult.addressLine_2 !== undefined &&
            pinResult.addressLine_2 !== ''
        )
            combinedResultAddress += ' ' + pinResult.addressLine_2.trim();

        combinedRequestAddress = combinedRequestAddress.replace(/'/g, '`');
        streetAddressScore = this.score(
            combinedResultAddress as string,
            combinedRequestAddress,
            thresholds.streetAddressThreshold,
            coefficients.streetAddressFuzzyCoefficient,
        );

        // City
        if (
            pinResult.city !== null &&
            pinResult.city !== undefined &&
            pinResult.city !== ''
        ) {
            if (requestBody.city === null || requestBody.city === undefined)
                cityScore = 0;
            else {
                requestBody.city = requestBody.city.replace(/'/g, '`');
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
            pinResult.provinceAbbreviation !== undefined &&
            pinResult.provinceAbbreviation !== ''
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
        if (
            pinResult.country !== null &&
            pinResult.country !== undefined &&
            pinResult.country !== ''
        ) {
            if (
                requestBody.country === null ||
                requestBody.country === undefined
            )
                countryScore = 0;
            else {
                requestBody.country = requestBody.country.replace(/'/g, '`');
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
            pinResult.postalCode !== undefined &&
            pinResult.postalCode !== ''
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
            weightsAndThresholds.weights.lastNamesWeight +
            weightsAndThresholds.weights.ownerNumberWeight +
            weightsAndThresholds.weights.streetAddressWeight +
            weightsAndThresholds.weights.cityWeight +
            weightsAndThresholds.weights.provinceAbbreviationWeight +
            weightsAndThresholds.weights.countryWeight +
            weightsAndThresholds.weights.postalCodeWeight;

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
        // logger.info(`Result score info below:`);
        // logger.info(result);
        return result as addressMatchScore;
    }

    /**
     * Helper function to determine the address score
     */
    private async addressScoreRank(
        @Body() requestBody: createPinRequestBody,
        scoreTrial?: boolean,
    ): Promise<addressScoreResults> {
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

        let pinResults;
        if (scoreTrial && scoreTrial === true) {
            const select = {
                livePinId: true,
                pids: true,
                titleNumber: true,
                landTitleDistrict: true,
                givenName: true,
                lastName_1: true,
                lastName_2: true,
                incorporationNumber: true,
                addressLine_1: true,
                addressLine_2: true,
                city: true,
                provinceAbbreviation: true,
                provinceLong: true,
                country: true,
                postalCode: true,
            };
            // Find Active PIN entry (or entries if more than one pid to insert or update
            pinResults = await findPin(select, where);
        } else {
            pinResults = await findPin(undefined, where);
        }
        pinResults = sortActivePinResults(pinResults);

        const updateResults = [];
        const borderlineResults = [];
        const pinResultKeys = Object.keys(pinResults);
        const contactMessages = new Set<string>();

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
                            this.weightsAndThresholds,
                        );
                        if (!('weightedAverage' in matchScore)) {
                            // it's a string array
                            for (const message of matchScore) {
                                contactMessages.add(message);
                            }
                            continue; // bad match, skip
                        }
                    } catch (err) {
                        if (err instanceof Error) logger.error(err.message);
                        continue; // skip this entry
                    }
                    if (scoreTrial && scoreTrial === true) {
                        updateResults.push({
                            ActivePin: pinResults[key][i],
                            matchScore,
                        });
                    } else if (
                        matchScore.weightedAverage >=
                        (this.weightsAndThresholds as any).thresholds
                            .overallThreshold
                    ) {
                        updateResults.push({
                            ActivePin: pinResults[key][i],
                            matchScore,
                        });
                    } else if (
                        matchScore.weightedAverage >=
                        (this.weightsAndThresholds as any).thresholds
                            .borderlineThreshold
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
        return {
            updateResults,
            borderlineResults,
            contactMessages,
            weightsThresholds: this.weightsAndThresholds,
        };
    }

    /**
     * Helper function dealing with the error messages for the address score
     */
    private noAddressResultErrMessage(
        @Body() requestBody: createPinRequestBody,
        contactMessages: Set<string>,
    ): string {
        let errMessage;
        if (contactMessages.size > 0) {
            errMessage = '';
            for (const message of contactMessages) {
                errMessage += message + `\n`;
            }
            errMessage = errMessage.substring(0, errMessage.length - 1);
        } else {
            errMessage = `Pids ${requestBody.pids} does not match the address and name / incorporation number given:\n`;
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
        }
        return errMessage;
    }
    /**
     * Internal method for creating or recreating a PIN for VHERS. The process is the same.
     */
    private async createOrRecreatePin(
        @Body() requestBody: createPinRequestBody,
    ): Promise<updatedPIN[]> {
        const gen: PINGenerator = new PINGenerator();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any[] = [];
        const score = await this.addressScoreRank(requestBody);

        if (score.updateResults.length > 0) {
            // skip the next checks
        } else if (
            score.updateResults.length <= 0 &&
            score.borderlineResults.length <= 0
        ) {
            const errMessage = this.noAddressResultErrMessage(
                requestBody,
                score.contactMessages,
            );
            throw new NotFoundError(errMessage);
        } else if (
            score.updateResults.length <= 0 &&
            score.borderlineResults.length > 0
        ) {
            // Give an error message related to the closest result
            let errMessage = `Close result: consider checking your `;
            if (
                Object.hasOwn(
                    score.borderlineResults[0].matchScore,
                    'postalCodeScore',
                ) &&
                score.borderlineResults[0].matchScore.postalCodeScore <
                    score.weightsThresholds.weights.postalCodeWeight
            ) {
                errMessage += `postal code`;
            } else if (
                Object.hasOwn(
                    score.borderlineResults[0].matchScore,
                    'incorporationNumberScore',
                ) &&
                score.borderlineResults[0].matchScore.incorporationNumberScore <
                    score.weightsThresholds.weights.incorporationNumberWeight
            ) {
                errMessage += `incorporation number`;
            } else if (
                score.borderlineResults[0].matchScore.streetAddressScore <
                score.weightsThresholds.weights.streetAddressWeight
            ) {
                errMessage += `address`;
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
        const resultToUpdate = score.updateResults[0].ActivePin; // this will be the one with the highest match score
        resultToUpdate.pin = pin.pin;
        const emailPhone: emailPhone = {
            email: requestBody.email,
            phoneNumber: requestBody.phoneNumber,
        };

        // Insert into DB
        const updatePinResponse = await singleUpdatePin(
            resultToUpdate,
            emailPhone,
            requestBody.propertyAddress,
        );

        const errors = updatePinResponse[0];

        if (errors.length >= 1) {
            throw new AggregateError(
                errors,
                `Error(s) occured in singleUpdatePin: `,
            );
        }

        // Prepare and return result
        if (resultToUpdate.pin) {
            const toPush: updatedPIN = {
                pids: resultToUpdate.pids,
                livePinId: resultToUpdate.livePinId,
            };
            result.push(toPush);
        }

        return result;
    }

    /**
     * Internal method for creating or recreating with external validation.
     */
    private async createOrRecreatePinServiceBC(
        requestBody: serviceBCCreateRequestBody,
        req: req,
    ): Promise<updatedPIN[]> {
        const result: any[] = [];
        // Validate that there is a requester
        let payload;
        try {
            payload = decodingJWT(req.cookies.token)?.payload;
        } catch (err) {
            throw new AuthenticationError(`Unable to decode JWT`, 403);
        }
        const username: string =
            payload.username && payload.username !== '' ? payload.username : '';
        let name: string = '';
        if (payload.given_name) {
            name = payload.given_name;
            if (payload.family_name) name = name + ' ' + payload.family_name;
        } else if (payload.family_name) {
            name = payload.family_name;
        } else {
            name = '';
        }
        if (username === '' || name === '') {
            throw new AuthenticationError(
                `Username or given / family name does not exist for requester`,
                403,
            );
        }
        const permissions: string[] | undefined = payload.permissions;
        let hasViewPermission = false;
        if (permissions && permissions.includes('VIEW_PIN')) {
            hasViewPermission = true;
        }
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

        const batchUpdatePinResponse = await batchUpdatePin(
            [pinResult[0]],
            emailPhone,
            requestBody.propertyAddress,
            username,
            name,
        );

        const errors = batchUpdatePinResponse[0];

        if (errors.length >= 1) {
            throw new AggregateError(
                errors,
                `Error(s) occured in batchUpdatePin: `,
            );
        }

        // Prepare and return results
        const toPush: updatedPIN = {
            pin: hasViewPermission ? pinResult[0].pin : undefined,
            pids: pinResult[0].pids,
            livePinId: pinResult[0].livePinId,
        };
        result.push(toPush);

        return result;
    }

    /**
     * Shows off the address match score function without actually updating pins.
     */
    @Security('vhers_api_key')
    @Post('score')
    public async addressScore(
        @Res()
        _invalidTokenErrorResponse: TsoaResponse<
            400,
            InvalidTokenErrorResponse
        >,
        @Res()
        _unauthorizedErrorResponse: TsoaResponse<
            401,
            UnauthorizedErrorResponse
        >,
        @Res() rangeErrorResponse: TsoaResponse<422, pinRangeErrorType>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Res()
        aggregateErrorResponse: TsoaResponse<422, aggregateValidationErrorType>,
        @Res()
        notFoundErrorResponse: TsoaResponse<422, EntityNotFoundErrorType>,
        @Body() requestBody: createPinRequestBody,
    ) {
        try {
            const score = await this.addressScoreRank(requestBody, true);
            if (score.updateResults.length > 0) {
                return score.updateResults[0];
            } else {
                const errMessage = this.noAddressResultErrMessage(
                    requestBody,
                    score.contactMessages,
                );
                throw new NotFoundError(errMessage);
            }
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
    }

    /**
     * Displays the current weights, thresholds and fuzzy match coefficients used for scoring addresses
     */
    @Security('vhers_api_key')
    @Get('thresholds')
    public async weightsThresholds(
        @Res()
        _invalidTokenErrorResponse: TsoaResponse<
            400,
            InvalidTokenErrorResponse
        >,
        @Res()
        _unauthorizedErrorResponse: TsoaResponse<
            401,
            UnauthorizedErrorResponse
        >,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
    ) {
        try {
            const values = this.dynamicImportCaller();
            return values;
        } catch (err) {
            if (err instanceof Error) {
                const message = `Error in weightsThresholds: failed to grab thresholds`;
                logger.warn(message);
                return serverErrorResponse(500, { message });
            }
        }
    }

    /**
     * Used to create a single, unique PIN, checking against the DB to do so.
     * Note that the address line, province, country and postal code information is that of the
     * mailing address used for identity verfication. The property address could differ, and will be used
     * in the GCNotify email / text message that is sent.
     * Expected error codes and messages:
     * - `400`
     * -- `Invalid Token`
     * - `401`
     * -- `Access Denied`
     * - `422`
     * -- `PIN must be of length 1 or greater`
     * -- `Too many PIN creation attempts: consider expanding your pin length or character set to allow more unique PINs.`
     * -- `Error(s) occured in singleUpdatePin: []`
     * - `500`
     *  -- `Internal Server Error`
     * @param The request body. See 'createRequestPinBody' in schemas for more details.
     * @returns An object containing the unique PIN
     */
    @Security('vhers_api_key')
    @Post('vhers-create')
    public async createPin(
        @Res()
        _invalidTokenErrorResponse: TsoaResponse<
            400,
            InvalidTokenErrorResponse
        >,
        @Res()
        _unauthorizedErrorResponse: TsoaResponse<
            401,
            UnauthorizedErrorResponse
        >,
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
     * Note that the address line, province, country and postal code information is that of the
     * mailing address used for identity verfication. The property address could differ, and will be used
     * in the GCNotify email / text message that is sent.
     * Expected error codes and messages:
     * - `422`
     * -- `PIN must be of length 1 or greater`
     * -- `Too many PIN creation attempts: consider expanding your pin length or character set to allow more unique PINs.`
     * -- `Error(s) occured in singleUpdatePin: []`
     * - `500`
     *  -- `Internal Server Error`
     * @param The request body. See 'createRequestPinBody' in schemas for more details.
     * @returns An object containing the unique PIN
     */
    @Security('vhers_api_key')
    @Post('vhers-regenerate')
    public async recreatePin(
        @Res()
        _invalidTokenErrorResponse: TsoaResponse<
            400,
            InvalidTokenErrorResponse
        >,
        @Res()
        _unauthorizedErrorResponse: TsoaResponse<
            401,
            UnauthorizedErrorResponse
        >,
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
     * Note that the property address given is just used for the GCNotify email / text message
     * and is not used for validation.
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
    @Middlewares(authenticate)
    @Post('create')
    public async serviceBCCreatePin(
        @Res() forbiddenErrorResponse: TsoaResponse<403, forbiddenError>,
        @Res() rangeErrorResponse: TsoaResponse<422, pinRangeErrorType>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Res()
        aggregateErrorResponse: TsoaResponse<422, aggregateValidationErrorType>,
        @Res()
        notFoundErrorResponse: TsoaResponse<422, EntityNotFoundErrorType>,
        @Body() requestBody: serviceBCCreateRequestBody,
        @Request() req: req,
    ): Promise<updatedPIN[]> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let res: any[] = [];
        try {
            res = await this.createOrRecreatePinServiceBC(requestBody, req);
        } catch (err) {
            if (err instanceof AuthenticationError) {
                logger.warn(
                    `Encountered authentication error in createPin: ${err.message}`,
                );
                return forbiddenErrorResponse(403, {
                    message: err.message,
                    code: 403,
                });
            }
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
     * Note that the property address given is just used for the GCNotify email / text message
     * and is not used for validation.
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
    @Middlewares(authenticate)
    @Post('regenerate')
    public async serviceBCRecreatePin(
        @Res() forbiddenErrorResponse: TsoaResponse<403, forbiddenError>,
        @Res() rangeErrorResponse: TsoaResponse<422, pinRangeErrorType>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Res()
        aggregateErrorResponse: TsoaResponse<422, aggregateValidationErrorType>,
        @Res()
        notFoundErrorResponse: TsoaResponse<422, EntityNotFoundErrorType>,
        @Body() requestBody: serviceBCCreateRequestBody,
        @Request() req: req,
    ): Promise<updatedPIN[]> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let res: any[] = [];
        try {
            res = await this.createOrRecreatePinServiceBC(requestBody, req);
        } catch (err) {
            if (err instanceof AuthenticationError) {
                logger.warn(
                    `Encountered authentication error in createPin: ${err.message}`,
                );
                return forbiddenErrorResponse(403, {
                    message: err.message,
                    code: 403,
                });
            }
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
    @Middlewares(authenticate)
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

    /** Private function to handle this for both the API Key and BCGov auth version */
    private async pinExpiration(@Body() requestBody: expireRequestBody) {
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
            throw new RequiredFieldError(message);
        }
        if (
            requestBody.expirationReason !==
                expirationReason.ChangeOfOwnership &&
            !requestBody.phoneNumber &&
            !requestBody.email
        ) {
            const message =
                'An email and/or phone number must be provided for non-system PIN expiration';
            logger.warn(message);
            throw new RequiredFieldError(message);
        }
        if (
            requestBody.expirationReason !==
                expirationReason.ChangeOfOwnership &&
            !requestBody.propertyAddress
        ) {
            const message =
                'Property address must be provided for non-system PIN expiration';
            logger.warn(message);
            throw new RequiredFieldError(message);
        }
        let deletedPin: ActivePin | undefined;

        try {
            deletedPin = await deletePin(
                requestBody,
                requestBody.livePinId,
                requestBody.expirationReason,
                expiredUsername,
            );
        } catch (err) {
            if (err instanceof EntityNotFoundError) {
                logger.warn(
                    `Encountered Entity Not Found Error in pinExpiration: ${err.message}`,
                );
                throw err;
            } else if (err instanceof TypeORMError) {
                logger.warn(
                    `Encountered TypeORM Error in pinExpiration: ${err.message}`,
                );
                throw err;
            } else if (err instanceof Error) {
                logger.warn(
                    `Encountered unknown Internal Server Error pinExpiration: ${err}`,
                );
                throw err;
            }
        }

        return deletedPin;
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
    @Middlewares(authenticate)
    @Post('expire')
    public async expirePin(
        @Res() entityErrorResponse: TsoaResponse<422, EntityNotFoundErrorType>,
        @Res() typeORMErrorResponse: TsoaResponse<422, GenericTypeORMErrorType>,
        @Res()
        requiredFieldErrorResponse: TsoaResponse<422, requiredFieldErrorType>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Body() requestBody: expireRequestBody,
    ): Promise<ActivePin | undefined> {
        try {
            const deletedPin = await this.pinExpiration(requestBody);
            return deletedPin;
        } catch (err) {
            // errors already logged
            if (err instanceof RequiredFieldError) {
                return requiredFieldErrorResponse(422, {
                    message: err.message,
                });
            }
            if (err instanceof EntityNotFoundError) {
                return entityErrorResponse(422, { message: err.message });
            } else if (err instanceof TypeORMError) {
                return typeORMErrorResponse(422, { message: err.message });
            } else if (err instanceof Error) {
                return serverErrorResponse(500, { message: err.message });
            }
        }
    }

    /**
     * Used for expiring pins by their id (livePinId) from the etl job. Requires a reason for expiration, and if not a change of ownership, the name and username of who is expiring the pin.
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
    @Security('vhers_api_key')
    @Post('etl-expire')
    public async expirePinEtl(
        @Res()
        _invalidTokenErrorResponse: TsoaResponse<
            400,
            InvalidTokenErrorResponse
        >,
        @Res()
        _unauthorizedErrorResponse: TsoaResponse<
            401,
            UnauthorizedErrorResponse
        >,
        @Res() entityErrorResponse: TsoaResponse<422, EntityNotFoundErrorType>,
        @Res() typeORMErrorResponse: TsoaResponse<422, GenericTypeORMErrorType>,
        @Res()
        requiredFieldErrorResponse: TsoaResponse<422, requiredFieldErrorType>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Body() requestBody: expireRequestBody,
    ): Promise<ActivePin | undefined> {
        try {
            const deletedPin = await this.pinExpiration(requestBody);
            return deletedPin;
        } catch (err) {
            // errors already logged
            if (err instanceof RequiredFieldError) {
                return requiredFieldErrorResponse(422, {
                    message: err.message,
                });
            }
            if (err instanceof EntityNotFoundError) {
                return entityErrorResponse(422, { message: err.message });
            } else if (err instanceof TypeORMError) {
                return typeORMErrorResponse(422, { message: err.message });
            } else if (err instanceof Error) {
                return serverErrorResponse(500, { message: err.message });
            }
        }
    }

    /**
     * Verifies the user given a PIN and the pid(s) associated with the title.
     * Note: some of the error return codes here are not semantically correct.
     * This is because of external vendor requirements and is unavoidable.
     * @param requestBody The body for the request. Note that pids should be seperated by a vertical bar (|)
     * @returns verified as true if verification was successful, and false otherwise along with a reason
     */
    @Security('vhers_api_key')
    @Post('verify')
    public async verifyPin(
        @Res()
        _invalidTokenErrorResponse: TsoaResponse<
            400,
            InvalidTokenErrorResponse
        >,
        @Res()
        _unauthorizedErrorResponse: TsoaResponse<
            401,
            UnauthorizedErrorResponse
        >,
        @Res() verificationErrorResponse: TsoaResponse<418, verifyPinResponse>,
        @Res() notFoundErrorResponse: TsoaResponse<410, verifyPinResponse>,
        @Res() serverErrorResponse: TsoaResponse<408, verifyPinResponse>,
        @Body() requestBody: verifyPinRequestBody,
    ): Promise<verifyPinResponse> {
        let matchId = '';
        try {
            const response = await findPin(
                { pin: true, pids: true, livePinId: true },
                { pin: requestBody.pin },
            );
            if (response.length < 1) {
                // we don't have a match
                throw new NotFoundError('PIN was unable to be verified');
            } else {
                const sortedPids = pidStringSplitAndSort(requestBody.pids);
                let isMatch = false;
                outerLoop: for (const result of response) {
                    const sortedResultPids = pidStringSplitAndSort(result.pids);
                    for (const resultPid of sortedResultPids) {
                        for (const dbPid of sortedPids) {
                            if (resultPid === dbPid) {
                                isMatch = true;
                                matchId = result.livePinId;
                                break outerLoop; // we have a match, can stop checking
                            }
                        }
                    }
                }
                if (isMatch === false)
                    throw new NonMatchingPidError('PIN and PID do not match');
            }
        } catch (err) {
            if (err instanceof NonMatchingPidError) {
                logger.warn(`Encountered error in verifyPin: ${err.message}`);
                return verificationErrorResponse(418, {
                    verified: false,
                    reason: {
                        errorType: 'NonMatchingPidError',
                        errorMessage: err.message,
                    },
                });
            }
            if (err instanceof NotFoundError) {
                logger.warn(`Encountered error in verifyPin: ${err.message}`);
                return notFoundErrorResponse(410, {
                    verified: false,
                    reason: {
                        errorType: 'NotFoundError',
                        errorMessage: err.message,
                    },
                });
            }
            if (err instanceof Error) {
                logger.warn(
                    `Encountered unknown Internal Server Error in verifyPin: ${err.message}`,
                );
                return serverErrorResponse(408, {
                    verified: false,
                    reason: { errorType: err.name, errorMessage: err.message },
                });
            }
        }
        return { verified: true, livePinId: matchId };
    }
}
