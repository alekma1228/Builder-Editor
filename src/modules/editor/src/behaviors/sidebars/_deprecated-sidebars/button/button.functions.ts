export function parseLinearGradient(linearGradient: string) {
  const regex = /((\d*)deg)|(rgb\(\d*, \d*, \d*\))|(\#(?:[a-f0-9]{6}))/gm;
  const resultGradient  = linearGradient.match(regex);
  if (resultGradient.length < 3) {
    resultGradient.unshift(null);
  }
  const [angle, startColor, endColor] = resultGradient;
  return {angle, startColor, endColor};
}
