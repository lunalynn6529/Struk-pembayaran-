import { UsageRecord, ReceiptCustomization } from '../types';
import { calculateUsageDetails } from '../data';

interface SheetExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

/**
 * Creates a new beautifully-styled Google Sheet in the user's Drive populated with their customer utility records.
 */
export async function exportToGoogleSheets(
  records: UsageRecord[],
  customSettings: ReceiptCustomization,
  accessToken: string
): Promise<SheetExportResult> {
  // 1. Create a new Google Spreadsheet
  const title = `Rekap Pemakaian Air - ${customSettings.namaPenyedia || 'Depo Hanum Qua'}`;
  
  const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: title
      }
    })
  });

  if (!createResponse.ok) {
    const errText = await createResponse.text();
    console.error('Failed to create sheet:', errText);
    throw new Error(`Gagal membuat Spreadsheet: ${createResponse.statusText}`);
  }

  const spreadsheet = await createResponse.json();
  const spreadsheetId = spreadsheet.spreadsheetId;
  const spreadsheetUrl = spreadsheet.spreadsheetUrl;
  
  // Get sheet ID (usually 0 for the default first sheet, but let's confirm from payload)
  const firstSheetId = spreadsheet.sheets?.[0]?.properties?.sheetId ?? 0;

  // 2. Prepare tabular data
  const headers = [
    'No. Pelanggan',
    'Nama Pelanggan',
    'Bulan',
    'Meter Awal (m³)',
    'Meter Akhir (m³)',
    'Volume (m³)',
    'Tarif Dasar (/m³)',
    'Biaya Air',
    'Biaya Admin',
    'Total Tagihan',
    'Catatan'
  ];

  const valueRows = records.map((r) => {
    const { volume, subtotal, total } = calculateUsageDetails(r);
    return [
      r.no,
      r.namaPelanggan,
      r.bulan,
      r.meterAwal,
      r.meterAkhir,
      volume,
      r.tarifDasar,
      subtotal,
      r.biayaAdmin,
      total,
      r.catatan || '-'
    ];
  });

  const allValues = [headers, ...valueRows];

  // 3. Write values to spreadsheet
  const writeResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range: 'Sheet1!A1',
        majorDimension: 'ROWS',
        values: allValues
      })
    }
  );

  if (!writeResponse.ok) {
    const errText = await writeResponse.text();
    console.error('Failed to write values:', errText);
    throw new Error('Gagal mengisi data ke Google Sheets');
  }

  // 4. Beautiful formatting:
  // Paint header row using Natural-Sage green background: RGB(68, 107, 78) -> normalized to (0.27, 0.42, 0.31)
  // Bold header row, auto-resize columns
  // Align left for names/notes and right for numerical/currency columns
  const batchUpdateRequest = {
    requests: [
      // Format headers
      {
        repeatCell: {
          range: {
            sheetId: firstSheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: headers.length
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: {
                red: 0.27,
                green: 0.42,
                blue: 0.31
              },
              textFormat: {
                bold: true,
                foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                fontSize: 10,
                fontFamily: 'Arial'
              },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE'
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
        }
      },
      // Number formatting for currencies and meters
      {
        repeatCell: {
          range: {
            sheetId: firstSheetId,
            startRowIndex: 1,
            endRowIndex: allValues.length,
            startColumnIndex: 3, // Meter Awal, Akhir, Volume
            endColumnIndex: 6
          },
          cell: {
            userEnteredFormat: {
              numberFormat: {
                type: 'NUMBER',
                pattern: '#,##0'
              },
              horizontalAlignment: 'RIGHT'
            }
          },
          fields: 'userEnteredFormat(numberFormat,horizontalAlignment)'
        }
      },
      // Currency formatting for Tarif dasar, Biaya Air, Admin, Total
      {
        repeatCell: {
          range: {
            sheetId: firstSheetId,
            startRowIndex: 1,
            endRowIndex: allValues.length,
            startColumnIndex: 6, // Tarif dasar
            endColumnIndex: 10   // up to Total Tagihan
          },
          cell: {
            userEnteredFormat: {
              numberFormat: {
                type: 'CURRENCY',
                pattern: '"Rp"#,##0'
              },
              horizontalAlignment: 'RIGHT'
            }
          },
          fields: 'userEnteredFormat(numberFormat,horizontalAlignment)'
        }
      },
      // Align left and center where appropriate
      {
        repeatCell: {
          range: {
            sheetId: firstSheetId,
            startRowIndex: 1,
            endRowIndex: allValues.length,
            startColumnIndex: 0,
            endColumnIndex: 1
          },
          cell: {
            userEnteredFormat: {
              horizontalAlignment: 'CENTER',
              textFormat: { bold: true }
            }
          },
          fields: 'userEnteredFormat(horizontalAlignment,textFormat.bold)'
        }
      },
      // Auto-fit all column widths
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId: firstSheetId,
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: headers.length
          }
        }
      }
    ]
  };

  const formatResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(batchUpdateRequest)
    }
  );

  if (!formatResponse.ok) {
    // Just log warning, do not block export if formatting alone fails
    console.warn('Formatting spreadsheet failed:', await formatResponse.text());
  }

  return {
    spreadsheetId,
    spreadsheetUrl
  };
}
