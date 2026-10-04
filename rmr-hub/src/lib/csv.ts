/** CSV cells and files for spreadsheets (Excel, Google Sheets, Numbers). */

export function csvCell(v: unknown): string {
  let s = v instanceof Date ? v.toISOString() : String(v ?? "");
  // Text starting with = + - @ would run as a formula in a spreadsheet; numbers are left alone.
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = `'${s}`;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(header: string[], rows: unknown[][]): string {
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
}
