import { describe, expect, it } from "vitest";
import { parseCSV } from "./bank-csv";
import { csvCell, toCsv } from "./csv";

describe("csvCell", () => {
  it("leaves plain values alone", () => {
    expect(csvCell("Kwame Logistics")).toBe("Kwame Logistics");
    expect(csvCell(12.5)).toBe("12.5");
    expect(csvCell(true)).toBe("true");
    expect(csvCell(null)).toBe("");
    expect(csvCell(undefined)).toBe("");
    expect(csvCell(new Date("2026-10-04T08:00:00Z"))).toBe("2026-10-04T08:00:00.000Z");
  });

  it("quotes commas, quotes and line breaks", () => {
    expect(csvCell("Mighty, Ltd")).toBe('"Mighty, Ltd"');
    expect(csvCell('the "big" one')).toBe('"the ""big"" one"');
    expect(csvCell("line 1\nline 2")).toBe('"line 1\nline 2"');
    expect(csvCell("line 1\r\nline 2")).toBe('"line 1\r\nline 2"');
  });

  it("quotes a lone carriage return, which spreadsheets read as a new row", () => {
    expect(csvCell("line 1\rline 2")).toBe('"line 1\rline 2"');
  });

  it("stops text being run as a spreadsheet formula", () => {
    expect(csvCell("=HYPERLINK(\"http://evil\",\"x\")")).toBe(`"'=HYPERLINK(""http://evil"",""x"")"`);
    expect(csvCell("=1+1")).toBe("'=1+1");
    expect(csvCell("+44 7879 438525")).toBe("'+44 7879 438525");
    expect(csvCell("-2+3+cmd|' /C calc'!A0")).toBe("'-2+3+cmd|' /C calc'!A0");
    expect(csvCell("@SUM(A1:A2)")).toBe("'@SUM(A1:A2)");
    expect(csvCell("\t=1+1")).toBe("'\t=1+1");
    expect(csvCell("\r=1+1")).toBe(`"'\r=1+1"`);
  });

  it("keeps negative numbers as numbers", () => {
    expect(csvCell(-12.5)).toBe("-12.5");
    expect(csvCell("-12.50")).toBe("-12.50");
    expect(csvCell("-3")).toBe("-3");
    expect(csvCell("-")).toBe("'-");
    expect(csvCell("-1e5")).toBe("'-1e5");
  });

  it("leaves = + - @ alone when they aren't first", () => {
    expect(csvCell("a=b")).toBe("a=b");
    expect(csvCell("me@example.com")).toBe("me@example.com");
  });
});

describe("toCsv", () => {
  it("joins header and rows", () => {
    expect(toCsv(["Name", "Amount"], [["A", "1.00"], ["B, C", -2]])).toBe('Name,Amount\nA,1.00\n"B, C",-2');
  });

  it("reads back as the same table (apart from the formula guard)", () => {
    const rows = [
      ["Mighty, Ltd", 'say "hi"', "two\nlines", "cr\ronly", "=1+1", "-5.00", ""],
      ["", "x", "y", "z", "@a", "+b", "plain"],
    ];
    const back = parseCSV(toCsv(["a", "b", "c", "d", "e", "f", "g"], rows));
    expect(back.slice(1)).toEqual([
      ["Mighty, Ltd", 'say "hi"', "two\nlines", "cr\ronly", "'=1+1", "-5.00", ""],
      ["", "x", "y", "z", "'@a", "'+b", "plain"],
    ]);
  });
});
