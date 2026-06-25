import * as XLSX from "xlsx";

export function exportToXlsx(
  rows: Record<string, unknown>[],
  filename = "export"
) {
  if (rows.length === 0) return;

  const worksheet = XLSX.utils.json_to_sheet(rows);

  const colWidths = Object.keys(rows[0]).map((key) => ({
    wch: Math.max(
      key.length,
      ...rows.map((r) => String(r[key] ?? "").length)
    ),
  }));
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToXlsxMultiSheet(
  sheets: { name: string; rows: Record<string, unknown>[] }[],
  filename = "export"
) {
  const workbook = XLSX.utils.book_new();

  for (const sheet of sheets) {
    if (sheet.rows.length === 0) continue;

    const worksheet = XLSX.utils.json_to_sheet(sheet.rows);

    const colWidths = Object.keys(sheet.rows[0]).map((key) => ({
      wch: Math.max(
        key.length,
        ...sheet.rows.map((r) => String(r[key] ?? "").length)
      ),
    }));
    worksheet["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  }

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToCsv(
  rows: Record<string, unknown>[],
  filename = "export"
) {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const escape = (val: unknown) =>
    `"${String(val ?? "").replace(/"/g, '""')}"`;

  const lines = [
    headers.map(escape).join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}