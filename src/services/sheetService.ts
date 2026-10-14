import initialData from '../data/sheetData.json';
import { ContactRecord } from '../types';

export const SHEET_ID = '1oenzjQh390rwWfXbybfcHGqVisqmeKUPRPvWDhNhau4';
export const SHEET_NAME = 'Sheet3';
export const CSV_EXPORT_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

export function parseCSV(csvText: string): ContactRecord[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal.trim());
      if (currentRow.some((col) => col.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((col) => col.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length <= 1) return [];

  // Skip header row
  return rows.slice(1).map((r) => ({
    sNo: (r[0] || '').trim(),
    agency: (r[1] || '').trim(),
    location: (r[2] || '').trim(),
    ownerName: (r[3] || '').trim(),
    registrationNumber: (r[4] || '').trim(),
    currentAddress: (r[5] || '').trim(),
    mobileNumber: (r[6] || '').trim(),
    streetName: (r[7] || '').trim(),
  })).filter((r) => r.agency || r.location || r.ownerName);
}

export async function fetchLiveSheetData(): Promise<ContactRecord[]> {
  try {
    const res = await fetch(CSV_EXPORT_URL, { cache: 'no-cache' });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const text = await res.text();
    const parsed = parseCSV(text);
    if (parsed.length > 0) {
      return parsed;
    }
    return initialData as ContactRecord[];
  } catch (err) {
    console.warn('Could not fetch live Google Sheet, using bundled data snapshot:', err);
    return initialData as ContactRecord[];
  }
}

export function getInitialRecords(): ContactRecord[] {
  return initialData as ContactRecord[];
}
