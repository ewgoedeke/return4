export type Detection = {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  classId: number;
};

export function postProcessDetections(raw: Float32Array, threshold = 0.4): Detection[] {
  const numAttributes = 85;
  const numDetections = raw.length / numAttributes;
  const results: Detection[] = [];

  for (let i = 0; i < numDetections; i++) {
    const base = i * numAttributes;
    const x_min = raw[base];
    const y_min = raw[base + 1];
    const x_max = raw[base + 2];
    const y_max = raw[base + 3];
    const objectness = raw[base + 4];

    let maxClassScore = -Infinity;
    let classId = -1;

    for (let j = 0; j < 80; j++) {
      const classScore = raw[base + 5 + j];
      if (classScore > maxClassScore) {
        maxClassScore = classScore;
        classId = j;
      }
    }

    const confidence = objectness * maxClassScore;

    if (confidence > threshold) {
      results.push({
        x: x_min,
        y: y_min,
        width: x_max - x_min,
        height: y_max - y_min,
        confidence,
        classId,
      });
    }
  }

  return results;
}
