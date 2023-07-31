import { Get, Route, Controller, Query, TsoaResponse, Res } from 'tsoa';
import {
    PINDictionary,
    PINObject,
    rangeErrorType,
    serverErrorType,
} from '../helpers/types';
import PINGenerator from '../helpers/PINGenerator';
import logger from '../middleware/logger';

@Route('pins')
export class PINController extends Controller {
    /**
     * Used for the initial creation of PINs, when none exist in the database yet.
     * @param quantity The quantity of PINs you wish to create.
     * @param pinLength The length of each PIN. Defaults to 8 characters.
     * @param allowedChars A string (not regex) of the characters to be used to
     * generate the pin. Defaults to all lowercase letters and numbers.
     * @returns An object containing an array of the created, unique PINs
     */
    @Get('initial-create')
    public async getInitialPins(
        @Res() rangeErrorResponse: TsoaResponse<422, rangeErrorType>,
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
                } as rangeErrorType);
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
