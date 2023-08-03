// eslint-disable spaced-comment
import { Get, Route, Controller, Query, TsoaResponse, Res } from 'tsoa';
import {
    PINDictionary,
    PINObject,
    createdPIN,
    pinRangeErrorType,
    serverErrorType,
} from '../helpers/types';
import PINGenerator from '../helpers/PINGenerator';
import logger from '../middleware/logger';

@Route('pins')
export class PINController extends Controller {
    /**
     * Used to create a single, unique PIN, checking against the DB to do so.
     * Expected error codes and messages:
     * - 422
     * -- 'PIN must be of length 1 or greater'
     * -- 'Too many PIN creation attempts: consider expanding your pin length or character set to allow more unique PINs.'
     * - 500
     *  -- 'Internal Server Error'
     * @param pinLength The length of each PIN. Defaults to 8 characters.
     * @param allowedChars A string (not regex) of the characters to be used to
     * generate the pin. Default is A-Z excluding O, and 1-9
     * @returns An object containing the unique PIN
     */
    @Get('create')
    public async getPin(
        @Res() rangeErrorResponse: TsoaResponse<422, pinRangeErrorType>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Query() pinLength?: number,
        @Query() allowedChars?: string,
    ): Promise<createdPIN> {
        const gen: PINGenerator = new PINGenerator();
        let pin: createdPIN = { pin: '' };
        try {
            pin = await gen.create(pinLength, allowedChars);
        } catch (err) {
            if (err instanceof RangeError) {
                logger.warn(
                    `Encountered Range Error in getPin: ${err.message}`,
                );
                return rangeErrorResponse(422, {
                    message: err.message,
                } as pinRangeErrorType);
            } else if (err instanceof Error) {
                logger.warn(
                    `Encountered unknown Internal Server Error in getPin: ${err.message}`,
                );
                return serverErrorResponse(500, { message: err.message });
            }
        }
        return pin;
    }

    /**
     * Used for the initial creation of PINs, when none exist in the database yet.
     * Expected error codes and messages:
     * - 422
     * 	-- 'PIN must be of length 1 or greater'
     * 	-- 'Quantity of PINs requested too high: guaranteed repeats for the given pin length and character set.'
     * 	-- 'The number of PINS created must be greater than 0.'
     * - 500
     * 	-- 'Internal Server Error'
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
}
