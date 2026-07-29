export type Random = () => number;

/** Fisher-Yates. Returns a new array; the input is untouched. */
export function shuffle<T>(input: readonly T[], random: Random = Math.random): T[] {
  const out = input.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
