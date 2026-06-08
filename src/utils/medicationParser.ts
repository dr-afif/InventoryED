import type { Medication } from '../types';

export type ParsedMedicationImportRow = {
  rowNumber: number;
  displayName: string;
  normalizedName: string;
  maxStockLevel: number;
  minStockLevel: number;
  status: "new" | "duplicate" | "error";
  error?: string;
};

export const normalizeMedicationName = (name: string) => {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const medicationAliases = ['medication', 'ubat', 'drug', 'drugname', 'medicine', 'name', 'namaubat'];
const maxStockAliases = ['maksimum', 'maximum', 'max', 'maxstock', 'par', 'parlevel', 'quantity', 'qty', 'kuantiti'];

export const parseMedicationBulkText = (text: string, existingMedications: Medication[]): ParsedMedicationImportRow[] => {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const splitRow = (row: string) => {
    if (row.includes('\t')) return row.split('\t');
    return row.split(',');
  };

  const firstRow = splitRow(lines[0]).map(c => c.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
  
  let nameIndex = -1;
  let maxIndex = -1;

  firstRow.forEach((cell, idx) => {
    if (medicationAliases.includes(cell)) nameIndex = idx;
    if (maxStockAliases.includes(cell)) maxIndex = idx;
  });

  const hasHeader = nameIndex !== -1 || maxIndex !== -1;
  const dataLines = hasHeader ? lines.slice(1) : lines;

  // Fallback if no header but two columns exist: assume Col 1 is Name, Col 2 is Max Stock
  if (!hasHeader) {
    nameIndex = 0;
    maxIndex = 1;
  }

  const results: ParsedMedicationImportRow[] = [];

  dataLines.forEach((line, idx) => {
    const rowNumber = hasHeader ? idx + 2 : idx + 1;
    const cells = splitRow(line).map(c => c.trim());
    
    let displayName = cells[nameIndex] || '';
    let maxStockRaw = cells[maxIndex] || '';

    // If fallback didn't work and we don't have enough cells
    if (!displayName || cells.length <= Math.max(nameIndex, maxIndex)) {
       // if we only have 1 column, it's an error
       if (cells.length === 1 && !maxStockRaw) {
          displayName = cells[0];
       }
    }

    if (!displayName) {
      results.push({
        rowNumber,
        displayName: 'Unknown',
        normalizedName: '',
        maxStockLevel: 0,
        minStockLevel: 0,
        status: 'error',
        error: 'Missing medication name'
      });
      return;
    }

    const maxStockLevel = Number(maxStockRaw);
    if (!maxStockRaw || !Number.isFinite(maxStockLevel) || maxStockLevel < 1) {
      results.push({
        rowNumber,
        displayName,
        normalizedName: normalizeMedicationName(displayName),
        maxStockLevel: 0,
        minStockLevel: 0,
        status: 'error',
        error: `Invalid max stock value: "${maxStockRaw}"`
      });
      return;
    }

    const minStockLevel = Math.ceil(maxStockLevel * 0.3);
    const normalizedName = normalizeMedicationName(displayName);
    const isDuplicate = existingMedications.some(m => m.normalizedName === normalizedName);

    results.push({
      rowNumber,
      displayName,
      normalizedName,
      maxStockLevel,
      minStockLevel,
      status: isDuplicate ? 'duplicate' : 'new'
    });
  });

  return results;
};
