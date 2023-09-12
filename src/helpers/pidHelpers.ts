import logger from '../middleware/logger';

/**
 * A helper function for converting pid strings to arrays
 * @param pids A vertical bar "|" seperated list of pids in string form
 * @return An array of strings representing the pids, in ascending order
 */
export function pidStringSplitAndSort(pids: string): string[] {
    const stringArray = pids.split('|');
    if (
        stringArray.length < 1 ||
        (stringArray.length === 1 && stringArray[0] === '')
    ) {
        const message = `Error in pidStringSplitAndSort: No pid to parse in input '${pids}'`;
        logger.warn(message);
        throw new Error(message);
    }

    const sortedArray = stringArray.sort(function (a, b) {
        return a.localeCompare(b, undefined, {
            numeric: true,
            sensitivity: 'accent',
        });
    });
    return sortedArray;
}

/**
 * A helper function for sorting pids
 * @param pids A vertical bar "|" seperated list of pids in string form
 * @return A vertical bar "|" seperated list of pids, sorted ascending, in string form
 */
export function pidStringSort(pids: string): string {
    const stringArray = pids.split('|');
    if (
        stringArray.length < 1 ||
        (stringArray.length === 1 && stringArray[0] === '')
    ) {
        const message = `Error in pidStringSort: No pid to parse in input '${pids}'`;
        logger.warn(message);
        throw new Error(message);
    }

    const sortedArray = stringArray.sort(function (a, b) {
        return a.localeCompare(b, undefined, {
            numeric: true,
            sensitivity: 'accent',
        });
    });
    let returnString = '';
    for (let i = 0; i < sortedArray.length; i++) {
        returnString += sortedArray[i];
        if (i < sortedArray.length - 1) returnString += '|';
    }
    return returnString;
}
