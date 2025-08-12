export function normalizeMath(input: string): string {
  if (!input) return input;
  // Preserve content inside $...$ math blocks; only normalize outside
  const parts = input.split('$');
  for (let i = 0; i < parts.length; i += 2) {
    let s = parts[i];
    // Make common LaTeX commands readable outside math
    s = s.replace(/\\frac\s*\{([^}]+)\}\s*\{([^}]+)\}/g, '($1)/($2)');
    s = s.replace(/\\times/g, '×');
    s = s.replace(/\\cdot/g, '·');
    parts[i] = s;
  }
  return parts.join('$');
}
