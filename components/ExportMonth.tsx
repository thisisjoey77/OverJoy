"use client";

import { useState } from "react";
import { fmt, MONTHS } from "@/lib/date";
import { useLedger } from "@/lib/store";

const colors = {
  navy: "FF07566F",
  cyan: "FF70E4ED",
  total: "FF56889D",
  line: "FFD5E1E4",
  white: "FFFFFFFF",
  text: "FF17313A",
  muted: "FF557079",
};

const fill = (argb: string) => ({ type: "pattern" as const, pattern: "solid" as const, fgColor: { argb } });
const border = { style: "thin" as const, color: { argb: colors.line } };
const dateValue = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export function ExportMonth({ month }: { month: string }) {
  const { general, specific, entries } = useLedger();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const exportFile = async () => {
    setBusy(true);
    setError("");
    try {
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "DayQuid";
      workbook.subject = `Spending for ${month}`;
      workbook.title = `DayQuid ${month}`;
      workbook.calcProperties.fullCalcOnLoad = true;

      const monthlyEntries = entries
        .filter((entry) => entry.date.startsWith(`${month}-`))
        .sort((a, b) => a.date.localeCompare(b.date));
      const capacity = Math.max(monthlyEntries.length + 25, 100);
      const firstDataRow = 6;
      const lastDataRow = firstDataRow + capacity - 1;

      const summary = workbook.addWorksheet("Summary", {
        properties: { tabColor: { argb: colors.cyan } },
        views: [{ showGridLines: false }],
      });
      const payments = workbook.addWorksheet("Payments", {
        properties: { tabColor: { argb: colors.navy } },
        views: [{ state: "frozen", ySplit: firstDataRow, showGridLines: false }],
      });
      payments.columns = [
        { header: "Date", key: "date", width: 16 },
        { header: "Amount", key: "amount", width: 16 },
        { header: "General category", key: "general", width: 25 },
        { header: "Specific tag", key: "specific", width: 30 },
        { header: "Note / caption", key: "note", width: 48 },
      ];
      payments.mergeCells("A1:E1");
      payments.getCell("A1").value = `DAYQUID  /  ${MONTHS[Number(month.slice(5)) - 1].toUpperCase()} ${month.slice(0, 4)}`;
      payments.getCell("A1").fill = fill(colors.navy);
      payments.getCell("A1").font = { bold: true, size: 16, color: { argb: colors.white } };
      payments.getCell("A1").alignment = { vertical: "middle" };
      payments.getRow(1).height = 34;
      payments.mergeCells("A2:E2");
      payments.getCell("A2").value = "One expenditure per row. Add a date, amount, category, specific tag and optional note.";
      payments.getCell("A2").fill = fill(colors.cyan);
      payments.getCell("A2").font = { color: { argb: colors.text }, italic: true };
      payments.getCell("A2").alignment = { vertical: "middle", wrapText: true };
      payments.getRow(2).height = 28;

      const headerRow = payments.getRow(5);
      headerRow.values = ["Date", "Amount", "General category", "Specific tag", "Note / caption"];
      headerRow.height = 28;
      headerRow.eachCell((cell) => {
        cell.fill = fill(colors.navy);
        cell.font = { bold: true, color: { argb: colors.white } };
        cell.alignment = { vertical: "middle", wrapText: true };
        cell.border = { bottom: border };
      });

      const generalById = new Map(general.map((tag) => [tag.id, tag.name]));
      const specificById = new Map(specific.map((tag) => [tag.id, tag.name]));
      monthlyEntries.forEach((entry, index) => {
        const row = payments.getRow(firstDataRow + index);
        row.values = [
          dateValue(entry.date),
          entry.amount,
          generalById.get(entry.general) ?? "",
          specificById.get(entry.specific) ?? "",
          entry.note,
        ];
      });

      for (let rowNumber = firstDataRow; rowNumber <= lastDataRow; rowNumber += 1) {
        const row = payments.getRow(rowNumber);
        row.height = 24;
        row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
          cell.border = { bottom: border };
          cell.alignment = { vertical: "middle", wrapText: columnNumber >= 3 };
          if (rowNumber % 2 === 0) cell.fill = fill("FFF5FAFB");
        });
        row.getCell(1).numFmt = "yyyy-mm-dd";
        row.getCell(2).numFmt = "#,##0.00;[Red]-#,##0.00";
      }
      payments.autoFilter = { from: "A5", to: `E${lastDataRow}` };

      const lists = workbook.addWorksheet("Tag lists");
      lists.state = "veryHidden";
      lists.getCell("A1").value = "General categories";
      lists.getCell("B1").value = "Specific tags";
      general.forEach((tag, index) => { lists.getCell(index + 2, 1).value = tag.name; });
      specific.forEach((tag, index) => { lists.getCell(index + 2, 2).value = tag.name; });
      if (general.length) {
        workbook.definedNames.add(`'Tag lists'!$A$2:$A$${general.length + 1}`, "GeneralTags");
        for (let row = firstDataRow; row <= lastDataRow; row += 1) {
          payments.getCell(row, 3).dataValidation = {
            type: "list", allowBlank: true, formulae: ["=GeneralTags"],
            showErrorMessage: true, errorTitle: "Choose a category", error: "Select a general category from the list.",
          };
        }
      }
      if (specific.length) {
        workbook.definedNames.add(`'Tag lists'!$B$2:$B$${specific.length + 1}`, "SpecificTags");
        for (let row = firstDataRow; row <= lastDataRow; row += 1) {
          payments.getCell(row, 4).dataValidation = {
            type: "list", allowBlank: true, formulae: ["=SpecificTags"],
            showErrorMessage: true, errorTitle: "Choose a tag", error: "Select a specific tag from the list.",
          };
        }
      }

      summary.columns = [
        { width: 26 }, { width: 18 }, { width: 4 }, { width: 25 }, { width: 18 },
      ];
      summary.mergeCells("A1:E1");
      summary.getCell("A1").value = `DAYQUID  /  ${MONTHS[Number(month.slice(5)) - 1].toUpperCase()} ${month.slice(0, 4)}`;
      summary.getCell("A1").fill = fill(colors.navy);
      summary.getCell("A1").font = { bold: true, size: 18, color: { argb: colors.white } };
      summary.getCell("A1").alignment = { vertical: "middle" };
      summary.getRow(1).height = 38;

      summary.getCell("A3").value = "TOTAL SPENDING";
      summary.getCell("A3").fill = fill(colors.navy);
      summary.getCell("A3").font = { bold: true, color: { argb: colors.white } };
      summary.getCell("A4").value = { formula: `SUM(Payments!$B$${firstDataRow}:$B$${lastDataRow})`, result: monthlyEntries.reduce((sum, entry) => sum + entry.amount, 0) };
      summary.getCell("A4").fill = fill(colors.cyan);
      summary.getCell("A4").font = { bold: true, size: 20, color: { argb: colors.text } };
      summary.getCell("A4").numFmt = "#,##0.00;[Red]-#,##0.00";
      summary.getCell("A4").alignment = { vertical: "middle" };
      summary.getRow(4).height = 38;

      summary.getCell("D3").value = "PAYMENTS";
      summary.getCell("D3").fill = fill(colors.navy);
      summary.getCell("D3").font = { bold: true, color: { argb: colors.white } };
      summary.getCell("D4").value = { formula: `COUNTA(Payments!$A$${firstDataRow}:$A$${lastDataRow})`, result: monthlyEntries.length };
      summary.getCell("D4").fill = fill(colors.cyan);
      summary.getCell("D4").font = { bold: true, size: 20, color: { argb: colors.text } };
      summary.getCell("D4").alignment = { vertical: "middle" };

      summary.getCell("A6").value = "BY CATEGORY";
      summary.getCell("A6").fill = fill(colors.navy);
      summary.getCell("A6").font = { bold: true, color: { argb: colors.white } };
      summary.getCell("B6").value = "TOTAL";
      summary.getCell("B6").fill = fill(colors.navy);
      summary.getCell("B6").font = { bold: true, color: { argb: colors.white } };
      general.forEach((tag, index) => {
        const rowNumber = 7 + index;
        const label = summary.getCell(rowNumber, 1);
        label.value = tag.name;
        label.fill = fill(`FF${tag.bg.slice(1)}`);
        label.font = { color: { argb: `FF${tag.color.slice(1)}` } };
        label.border = { bottom: border };
        const totalCell = summary.getCell(rowNumber, 2);
        totalCell.value = {
          formula: `SUMIF(Payments!$C$${firstDataRow}:$C$${lastDataRow},A${rowNumber},Payments!$B$${firstDataRow}:$B$${lastDataRow})`,
          result: monthlyEntries.filter((entry) => generalById.get(entry.general) === tag.name).reduce((sum, entry) => sum + entry.amount, 0),
        };
        totalCell.numFmt = "#,##0.00;[Red]-#,##0.00";
        totalCell.border = { bottom: border };
      });

      summary.getCell("D6").value = "BY WEEK";
      summary.getCell("D6").fill = fill(colors.navy);
      summary.getCell("D6").font = { bold: true, color: { argb: colors.white } };
      summary.getCell("E6").value = "TOTAL";
      summary.getCell("E6").fill = fill(colors.navy);
      summary.getCell("E6").font = { bold: true, color: { argb: colors.white } };
      const [year, monthNumber] = month.split("-").map(Number);
      const first = new Date(year, monthNumber - 1, 1);
      const last = new Date(year, monthNumber, 0);
      const weekStart = new Date(first);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      let weekRow = 7;
      for (let start = new Date(weekStart); start <= last; start.setDate(start.getDate() + 7)) {
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        const clippedStart = start < first ? first : start;
        const clippedEnd = end > last ? last : end;
        summary.getCell(weekRow, 4).value = `${fmt(clippedStart)} – ${fmt(clippedEnd)}`;
        summary.getCell(weekRow, 4).fill = fill(colors.total);
        summary.getCell(weekRow, 4).font = { color: { argb: colors.white } };
        summary.getCell(weekRow, 5).value = {
          formula: `SUMIFS(Payments!$B$${firstDataRow}:$B$${lastDataRow},Payments!$A$${firstDataRow}:$A$${lastDataRow},\">="&DATE(${clippedStart.getFullYear()},${clippedStart.getMonth() + 1},${clippedStart.getDate()}),Payments!$A$${firstDataRow}:$A$${lastDataRow},\"<="&DATE(${clippedEnd.getFullYear()},${clippedEnd.getMonth() + 1},${clippedEnd.getDate()}))`,
          result: monthlyEntries.filter((entry) => entry.date >= fmt(clippedStart) && entry.date <= fmt(clippedEnd)).reduce((sum, entry) => sum + entry.amount, 0),
        };
        summary.getCell(weekRow, 5).fill = fill(colors.total);
        summary.getCell(weekRow, 5).font = { color: { argb: colors.white } };
        summary.getCell(weekRow, 5).numFmt = "#,##0.00;[Red]-#,##0.00";
        weekRow += 1;
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer as BlobPart], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dayquid-${month}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create the spreadsheet");
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="export-control">
      <button className="btn export-btn" type="button" onClick={exportFile} disabled={busy}>
        <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 2v8m0 0 3-3m-3 3L5 7M3 11v2h10v-2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
        </svg>
        {busy ? "Preparing…" : "Export .xlsx"}
      </button>
      {error && <span className="export-error" role="alert">{error}</span>}
    </span>
  );
}
