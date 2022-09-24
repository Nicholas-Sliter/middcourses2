

export function getFrequencies(str: string) {
    return Array.from(str)
        .reduce((freq, c) => (freq[c] = (freq[c] || 0) + 1) && freq, {}) as { [key: string]: number };
}


// Shannon entropy in bits per symbol.
function shannonEntropy(str: string): number {
    const len = str.length;

    // Build a frequency map from the string.
    const frequencies = getFrequencies(str);

    // Sum the frequency of each character.
    return Object.values(frequencies)
        .reduce((sum, f) => sum - f / len * Math.log2(f / len), 0);
}


function metricEntropy(str: string) {
    const len = str.length;
    const sEntropy = shannonEntropy(str);
    return sEntropy / len;
}


export default metricEntropy;