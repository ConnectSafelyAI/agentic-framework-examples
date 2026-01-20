/**
 * Google Sheets API client for spreadsheet operations
 */

import { getAccessToken } from "./auth.js";

export interface CreateSheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export class GoogleSheetsClient {
  private baseUrl = "https://sheets.googleapis.com/v4/spreadsheets";

  async createSpreadsheet(
    title: string,
    sheetName: string,
    headers: string[]
  ): Promise<CreateSheetResult> {
    const accessToken = await getAccessToken();

    const createRes = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: { title },
        sheets: [{
          properties: {
            title: sheetName,
            gridProperties: { frozenRowCount: 1 },
          },
        }],
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Failed to create spreadsheet: ${err}`);
    }

    const data = (await createRes.json()) as CreateSheetResult;
    await this.appendRows(data.spreadsheetId, sheetName, [headers]);
    return data;
  }

  async getExistingProfileIds(
    spreadsheetId: string,
    sheetName: string
  ): Promise<Set<string>> {
    const accessToken = await getAccessToken();

    const readRes = await fetch(
      `${this.baseUrl}/${spreadsheetId}/values/${sheetName}`,
      { headers: { Authorization: `Bearer ${accessToken.trim()}` } }
    );

    if (!readRes.ok) throw new Error("Failed to read spreadsheet");

    const sheetData = (await readRes.json()) as { values?: any[][] };
    const existingProfileIds = new Set<string>();

    (sheetData.values || []).slice(1).forEach((row: any[]) => {
      if (row?.[0]) existingProfileIds.add(String(row[0]));
    });

    return existingProfileIds;
  }

  async appendRows(
    spreadsheetId: string,
    sheetName: string,
    rows: any[][]
  ): Promise<void> {
    if (rows.length === 0) return;

    const accessToken = await getAccessToken();

    const appendRes = await fetch(
      `${this.baseUrl}/${spreadsheetId}/values/${sheetName}:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: rows }),
      }
    );

    if (!appendRes.ok) throw new Error("Failed to append rows");
  }
}
