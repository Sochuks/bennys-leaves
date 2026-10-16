export function isValidIsbn13(code: string): boolean {
  if (!/^97[89]\d{10}$/.test(code)) return false

  const digits = code.split('').map(Number)
  const weightedSum = digits
    .slice(0, 12)
    .reduce((sum, digit, index) => sum + digit * (index % 2 === 0 ? 1 : 3), 0)

  const expectedCheckDigit = (10 - (weightedSum % 10)) % 10
  return digits[12] === expectedCheckDigit
}