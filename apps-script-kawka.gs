const CONTRIBUTIONS_SHEET_NAME = "kawka";
const EXPENSES_SHEET_NAME = "wydatki";

function getOrCreateSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const contributionsSheet = getOrCreateSheet_(ss, CONTRIBUTIONS_SHEET_NAME, ["Data", "Imię", "Nazwisko", "Kwota"]);
    const expensesSheet = getOrCreateSheet_(ss, EXPENSES_SHEET_NAME, ["Data", "Opis", "Kwota"]);

    const action = (e && e.parameter && e.parameter.action) || "";
    if (action !== "dashboard" && action !== "list") {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, message: "API działa" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const contributions = [];
    const expenses = [];

    const lastContributionRow = contributionsSheet.getLastRow();
    if (lastContributionRow >= 2) {
      const values = contributionsSheet.getRange(2, 1, lastContributionRow - 1, 4).getValues();
      for (const row of values) {
        contributions.push({
          date: row[0] ? new Date(row[0]).toISOString() : "",
          firstName: row[1] || "",
          lastName: row[2] || "",
          amount: Number(row[3]) || 0,
        });
      }
    }

    const lastExpenseRow = expensesSheet.getLastRow();
    if (lastExpenseRow >= 2) {
      const values = expensesSheet.getRange(2, 1, lastExpenseRow - 1, 3).getValues();
      for (const row of values) {
        expenses.push({
          date: row[0] ? new Date(row[0]).toISOString() : "",
          name: row[1] || "",
          amount: Number(row[2]) || 0,
        });
      }
    }

    if (action === "list") {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, contributions }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, contributions, expenses }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const contributionsSheet = getOrCreateSheet_(ss, CONTRIBUTIONS_SHEET_NAME, ["Data", "Imię", "Nazwisko", "Kwota"]);
    const expensesSheet = getOrCreateSheet_(ss, EXPENSES_SHEET_NAME, ["Data", "Opis", "Kwota"]);
    const data = JSON.parse(e.postData.contents);
    const type = data.type || "contribution";

    if (type === "expense") {
      expensesSheet.appendRow([
        new Date(),
        data.name || data.description || "",
        Number(data.amount) || 0,
      ]);
    } else {
      contributionsSheet.appendRow([
        new Date(),
        data.firstName || "",
        data.lastName || "",
        Number(data.amount) || 0,
      ]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
