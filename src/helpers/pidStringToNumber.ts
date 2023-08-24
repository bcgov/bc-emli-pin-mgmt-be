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
    if (stringArray.length < 1) {
        const message = `Error in pidStringToNumber: No pid to parse in input '${pids}'`;
        logger.error(message);
        throw new Error(message);
    }

    const numArray: number[] = [];
    try {
        if (stringArray.length === 1) {
            return parseInt(stringArray[0]);
        }
        stringArray.forEach((pid) => {
            numArray.push(parseInt(pid));
        });
    } catch (err) {
        if (err instanceof Error) {
            logger.error(`Error in pidStringToNumber: ${err.message}`);
            throw err;
        }
    }
    return numArray;
}
