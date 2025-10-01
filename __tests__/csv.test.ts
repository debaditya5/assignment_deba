import { toCsv } from "@lib/csv";

describe("toCsv", () => {
  it("formats simple array of objects", () => {
    const rows = [
      { a: 1, b: "x" },
      { a: 2, b: "y" },
    ];
    const csv = toCsv(rows);
    expect(csv.split("\n")[0]).toBe("a,b");
    expect(csv).toContain("1,x");
    expect(csv).toContain("2,y");
  });

  it("escapes commas and quotes", () => {
    const rows = [{ a: "hello,\"world\"", b: 2 }];
    const csv = toCsv(rows);
    expect(csv).toContain('"hello,""world"""');
  });
});


