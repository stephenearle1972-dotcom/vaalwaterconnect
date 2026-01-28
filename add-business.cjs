/**
 * Add a new business to VaalwaterConnect Google Sheet
 */

const { google } = require('googleapis');

const SPREADSHEET_ID = '1b_O-Xe8LGFjvAiHgskwJ-LVR6AbxN0fQL76pULg1CiI';
const CREDENTIALS_PATH = 'F:/My Drive/TOWN CONNECT/google-sheets-credentials.json';
const SHEET_NAME = 'vaalwater_business_listings_LIVE';

async function addBusiness() {
  console.log('🔄 Adding new business to VaalwaterConnect...\n');

  try {
    const credentials = require(CREDENTIALS_PATH);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // First, get current data to find next ID
    console.log('📊 Reading current data to find next ID...');
    const currentData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!A:A`,
    });

    const ids = currentData.data.values
      .slice(1) // Skip header
      .map(row => parseInt(row[0]))
      .filter(id => !isNaN(id));

    const nextId = Math.max(...ids) + 1;
    console.log(`   Current max ID: ${Math.max(...ids)}`);
    console.log(`   Next ID: ${nextId}\n`);

    // New business data
    // Columns: id | town | sectorId | subcategory | name | description | phone | whatsapp | email | website | facebook | instagram | address | lat | lng | tier | isFeatured | tags | imageUrl
    const newBusiness = [
      nextId.toString(),                        // id
      'Vaalwater',                              // town
      'health-wellness',                        // sectorId
      'Wellness Products',                      // subcategory
      'Health and Beauty',                      // name
      'SA #1 in Weightloss and Cosmetic products. Lifestyle products. Feel the results fast. Proven results for more than 36 years.', // description
      '0782898606',                             // phone
      '0782898606',                             // whatsapp
      'healthyandbeautifull02@gmail.com',       // email
      '',                                       // website
      '',                                       // facebook
      '',                                       // instagram
      '61 Bosveld Street, Vaalwater',           // address
      '-24.2967',                               // lat
      '28.0731',                                // lng
      'micro',                                  // tier
      'FALSE',                                  // isFeatured
      'health, beauty, weightloss, weight loss, cosmetics, lifestyle, slimming, gesondheid, skoonheid, gewig verloor', // tags
      '',                                       // imageUrl
    ];

    console.log('📝 Adding business:');
    console.log(`   ID: ${newBusiness[0]}`);
    console.log(`   Name: ${newBusiness[4]}`);
    console.log(`   Sector: ${newBusiness[2]}`);
    console.log(`   Subcategory: ${newBusiness[3]}`);
    console.log(`   Phone: ${newBusiness[6]}`);
    console.log(`   Address: ${newBusiness[12]}\n`);

    // Append the row
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!A:S`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [newBusiness],
      },
    });

    console.log('✅ BUSINESS ADDED SUCCESSFULLY!\n');
    console.log(`   Updated range: ${response.data.updates.updatedRange}`);
    console.log(`   Cells updated: ${response.data.updates.updatedCells}`);

    // Verify by reading back
    console.log('\n🔍 Verifying...\n');

    const verifyResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!A:E`,
    });

    const allRows = verifyResponse.data.values;
    const addedRow = allRows.find(row => row[0] === nextId.toString());

    if (addedRow) {
      console.log('🎉 CONFIRMED! New business in sheet:');
      console.log(`   ID: ${addedRow[0]}`);
      console.log(`   Town: ${addedRow[1]}`);
      console.log(`   Sector: ${addedRow[2]}`);
      console.log(`   Subcategory: ${addedRow[3]}`);
      console.log(`   Name: ${addedRow[4]}`);
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.log('\nFull error:', error);
  }
}

addBusiness();
