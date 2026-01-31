/**
 * Update Analytics Sheet with New Columns and Tabs
 * Run with: node update-analytics-sheet.cjs
 */

const { google } = require('googleapis');

const SPREADSHEET_ID = '16O36aIzaBt9IyApdZZ4P7YaKx1274Urp1xPAX6BTNTA';
const CREDENTIALS_PATH = 'F:/My Drive/TOWN CONNECT/google-sheets-credentials.json';

async function updateAnalyticsSheet() {
  console.log('🔄 Updating Analytics Sheet...\n');

  try {
    let credentials;
    try {
      credentials = require(CREDENTIALS_PATH);
    } catch (e) {
      // Try alternate path with double extension (legacy)
      credentials = require(CREDENTIALS_PATH + '.json');
    }

    console.log('✅ Credentials loaded');
    console.log(`   Service Account: ${credentials.client_email}\n`);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // =====================================================
    // TASK 1: Add new column headers to Analytics sheet
    // =====================================================
    console.log('📝 TASK 1: Adding new column headers to Analytics sheet...');

    try {
      // First, read existing headers to verify current state
      const headersRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "'Analytics'!A1:J1",
      });

      console.log('   Current headers:', headersRes.data.values?.[0] || 'None');

      // Update headers G1:J1
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "'Analytics'!G1:J1",
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['session_id', 'is_test', 'response_time_ms', 'language_detected']],
        },
      });

      console.log('   ✅ Added headers: session_id, is_test, response_time_ms, language_detected\n');
    } catch (err) {
      console.log('   ❌ Error updating Analytics headers:', err.message, '\n');
    }

    // =====================================================
    // TASK 2: Create "Gap Analysis" tab
    // =====================================================
    console.log('📝 TASK 2: Creating "Gap Analysis" tab...');

    try {
      // First check if sheet exists
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });

      const existingSheets = spreadsheet.data.sheets.map(s => s.properties.title);
      console.log('   Existing tabs:', existingSheets.join(', '));

      if (existingSheets.includes('Gap Analysis')) {
        console.log('   ⚠️  "Gap Analysis" tab already exists, updating headers only...');
      } else {
        // Create new sheet
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: 'Gap Analysis',
                  gridProperties: { rowCount: 1000, columnCount: 10 },
                },
              },
            }],
          },
        });
        console.log('   ✅ Created "Gap Analysis" tab');
      }

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "'Gap Analysis'!A1:E1",
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['search_term', 'search_count', 'last_searched', 'status', 'notes']],
        },
      });
      console.log('   ✅ Added headers to "Gap Analysis"\n');

    } catch (err) {
      console.log('   ❌ Error with Gap Analysis tab:', err.message, '\n');
    }

    // =====================================================
    // TASK 3: Create "Daily Summary" tab
    // =====================================================
    console.log('📝 TASK 3: Creating "Daily Summary" tab...');

    try {
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });

      const existingSheets = spreadsheet.data.sheets.map(s => s.properties.title);

      if (existingSheets.includes('Daily Summary')) {
        console.log('   ⚠️  "Daily Summary" tab already exists, updating headers only...');
      } else {
        // Create new sheet
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: 'Daily Summary',
                  gridProperties: { rowCount: 1000, columnCount: 10 },
                },
              },
            }],
          },
        });
        console.log('   ✅ Created "Daily Summary" tab');
      }

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "'Daily Summary'!A1:F1",
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['date', 'total_searches', 'successful_searches', 'hit_rate_percent', 'top_search_term', 'unique_towns']],
        },
      });
      console.log('   ✅ Added headers to "Daily Summary"\n');

    } catch (err) {
      console.log('   ❌ Error with Daily Summary tab:', err.message, '\n');
    }

    console.log('🎉 Analytics sheet update complete!');
    console.log(`\n📊 View sheet: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`);

  } catch (error) {
    console.error('❌ ERROR:', error.message);

    if (error.message.includes('permission') || error.code === 403) {
      console.log('\n💡 The service account may not have Editor access to this sheet.');
      console.log('   Share the sheet with:', 'townconnect-sheets@gen-lang-client-0093084150.iam.gserviceaccount.com');
      console.log('   And give it Editor permissions.');
    }

    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('\n💡 Credentials file not found. Checking paths...');
      console.log('   Tried:', CREDENTIALS_PATH);
      console.log('   Also tried:', CREDENTIALS_PATH + '.json');
    }
  }
}

updateAnalyticsSheet();
