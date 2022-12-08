/* Cosine Simularity */
export default function cosineSimularity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let aMagnitude = 0;
    let bMagnitude = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        aMagnitude += a[i] ** 2;
        bMagnitude += b[i] ** 2;
    }

    aMagnitude = Math.sqrt(aMagnitude);
    bMagnitude = Math.sqrt(bMagnitude);

    return dotProduct / (aMagnitude * bMagnitude);
}
