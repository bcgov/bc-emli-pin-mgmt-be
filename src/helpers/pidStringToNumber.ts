import logger from '../middleware/logger';

/**
 * A helper function for converting pid strings to numbers or arrays
 * @param pids A vertical bar "|" seperated list of pids in string form
 * @return A number or array of numbers representing the pids
 */
export function pidStringToNumber(pids: string | number): number[] | number {
    // A single pid should just return
    if (typeof pids == 'number') {
        return pids;
    }
    const stringArray = pids.split('|');
    if (
        stringArray.length < 1 ||
        (stringArray.length === 1 && stringArray[0] === '')
    ) {
        const message = `Error in pidStringToNumber: No pid to parse in input '${pids}'`;
        logger.warn(message);
        throw new Error(message);
    }

    const numArray: number[] = [];
    try {
        if (stringArray.length === 1) {
            if (stringArray[0].trim().match(/[\D]+/)) {
                throw new RangeError(
                    `Error in pidStringToNumber: pid(s) given (${pids}) are invalid`,
                );
            }
            const parse = parseInt(stringArray[0]);
            if (!isNaN(parse) && isFinite(parse)) {
                return parse;
            } else {
                throw new RangeError(
                    `Error in pidStringToNumber: pid(s) given (${pids}) are invalid`,
                );
            }
        }
        stringArray.forEach((pid) => {
            if (pid.trim().match(/[\D]+/)) {
                throw new RangeError(
                    `Error in pidStringToNumber: pid(s) given (${pids}) are invalid`,
                );
            }
            const parse = parseInt(pid);
            if (!isNaN(parse) && isFinite(parse)) {
                numArray.push(parse);
            } else {
                throw new RangeError(
                    `Error in pidStringToNumber: pid(s) given (${pids}) are invalid`,
                );
            }
        });
    } catch (err) {
        if (err instanceof Error) {
            logger.warn(`${err.message}`);
            throw err;
        }
    }
    return numArray;
}
