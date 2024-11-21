type NameComponents = {
    givenNames: string[];
    lastName: string;
    suffix: string | null;
};

/**
 * Tokenizes and normalizes a full name string into its components: given names, last name, and suffix.
 * @param {string} fullName - The full name string to be tokenized and split.
 * @returns {NameComponents} An object containing the given names, last name, and suffix (if present).
 */
function tokenizeAndSplitName(fullName: string): NameComponents {
    const suffixes = ['jr', 'junior', 'iii', 'iv', 'sr'];
    const tokens = fullName
        .trim()
        .toLowerCase()
        .replace(/[.,]/g, '') // Remove punctuation
        .split(/\s+|-/); // Split by spaces or hyphens
    let givenNames: string[] = [];
    let lastName = '';
    let suffix: string | null = null;

    if (tokens.length > 1) {
        // Check if the last token is a suffix
        if (suffixes.includes(tokens[tokens.length - 1])) {
            suffix = tokens.pop()!;
        }
        // Set the last token as the last name
        lastName = tokens.pop()!;
        givenNames = tokens;
    } else {
        // Single token name (e.g., "Madonna")
        givenNames = tokens;
    }

    return { givenNames, lastName, suffix };
}

/**
 * Calculates the partial match score between two arrays of given names.
 * @param {string[]} givenNames1 - The array of given names from the first name.
 * @param {string[]} givenNames2 - The array of given names from the second name.
 * @returns {number} A percentage score representing the match between the given names.
 */
function partialGivenNameMatch(
    givenNames1: string[],
    givenNames2: string[],
): number {
    const matches = givenNames1.filter((name) =>
        givenNames2.includes(name),
    ).length;
    return (matches / Math.max(givenNames1.length, givenNames2.length)) * 100;
}

/**
 * Calculates the overall match score between two name components, weighing given names, last names, and suffixes.
 * @param {NameComponents} name1 - The components of the first name.
 * @param {NameComponents} name2 - The components of the second name.
 * @returns {number} A weighted score representing the overall match between the two names.
 */
function calculateNameMatchScore(
    name1: NameComponents,
    name2: NameComponents,
): number {
    const givenNameScore =
        partialGivenNameMatch(name1.givenNames, name2.givenNames) * 0.4; // 40% weight
    const lastNameScore = (name1.lastName === name2.lastName ? 100 : 0) * 0.5; // 50% weight
    const suffixScore = (name1.suffix === name2.suffix ? 100 : 0) * 0.1; // 10% weight

    return givenNameScore + lastNameScore + suffixScore;
}

/**
 * Compares two full names and returns a match score based on their components.
 * @param {string} fullName1 - The first full name to be compared.
 * @param {string} fullName2 - The second full name to be compared.
 * @returns {number} A match score representing the similarity between the two names.
 */
export function compareNames(fullName1: string, fullName2: string): number {
    const name1Components = tokenizeAndSplitName(fullName1);
    const name2Components = tokenizeAndSplitName(fullName2);

    return calculateNameMatchScore(name1Components, name2Components);
}

// // Example usage
// const fullName1 = 'John Michael Smith Jr.';
// const fullName2 = 'John Smith';
// const matchScore = compareNames(fullName1, fullName2);
// console.log(`Match Score: ${matchScore}%`);
