/**
 * Script to add community listing tabs to Vaalwater Google Sheet
 * Run with: node scripts/setup-community-sheets.js
 */

import { google } from 'googleapis';
import fs from 'fs';

// Service account credentials
const CREDENTIALS_PATH = 'F:\\My Drive\\TOWN CONNECT\\google-sheets-credentials.json.json';

// Tab configurations with headers
const COMMUNITY_TABS = [
  {
    name: 'Events',
    headers: ['id', 'title', 'organizer_name', 'event_type', 'description', 'date', 'start_time', 'end_time', 'location', 'address', 'ticket_price', 'booking_link', 'image_url', 'contact_phone', 'contact_email', 'is_featured', 'status']
  },
  {
    name: 'Jobs',
    headers: ['id', 'title', 'business_name', 'job_type', 'sector_id', 'description', 'requirements', 'salary_range', 'location', 'application_method', 'application_contact', 'posted_date', 'is_active', 'status']
  },
  {
    name: 'Classifieds',
    headers: ['id', 'title', 'category', 'subcategory', 'description', 'price', 'condition', 'seller_name', 'seller_phone', 'seller_email', 'location', 'image_url', 'posted_date', 'is_active', 'status']
  },
  {
    name: 'Property',
    headers: ['id', 'title', 'listing_type', 'property_type', 'price', 'bedrooms', 'bathrooms', 'size', 'description', 'address', 'lat', 'lng', 'features', 'agent_name', 'agent_phone', 'agent_email', 'image_urls', 'posted_date', 'is_featured', 'status']
  },
  {
    name: 'Notices',
    headers: ['id', 'title', 'category', 'description', 'contact_name', 'contact_phone', 'contact_email', 'location', 'image_url', 'posted_date', 'expiry_date', 'is_active', 'status']
  }
];

async function main() {
  try {
    // Load credentials
    console.log('Loading credentials...');
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.readonly'
      ]
    });

    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // Search for the Vaalwater spreadsheet
    console.log('Searching for Vaalwater spreadsheet...');
    const searchResponse = await drive.files.list({
      q: "name contains 'VaalwaterConnect' and mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    if (!searchResponse.data.files || searchResponse.data.files.length === 0) {
      console.log('No spreadsheet found. Listing all accessible spreadsheets...');
      const allSheets = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet'",
        fields: 'files(id, name)',
        spaces: 'drive',
        pageSize: 20
      });
      console.log('Accessible spreadsheets:', allSheets.data.files);
      return;
    }

    const spreadsheet = searchResponse.data.files[0];
    console.log(`Found spreadsheet: ${spreadsheet.name} (ID: ${spreadsheet.id})`);
    const SPREADSHEET_ID = spreadsheet.id;

    // Get existing sheets info
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    });

    const existingSheets = spreadsheetInfo.data.sheets.map(s => s.properties.title);
    console.log('Existing tabs:', existingSheets);

    // Add each community tab if it doesn't exist
    for (const tab of COMMUNITY_TABS) {
      if (existingSheets.includes(tab.name)) {
        console.log(`Tab "${tab.name}" already exists, skipping...`);
        continue;
      }

      console.log(`Creating tab: ${tab.name}...`);

      // Add the sheet
      const addResponse = await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: tab.name
              }
            }
          }]
        }
      });

      const newSheetId = addResponse.data.replies[0].addSheet.properties.sheetId;
      console.log(`  Created with sheetId: ${newSheetId}`);

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${tab.name}!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [tab.headers]
        }
      });
      console.log(`  Headers added: ${tab.headers.length} columns`);

      // Format header row (bold, freeze)
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: newSheetId,
                  startRowIndex: 0,
                  endRowIndex: 1
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: { bold: true },
                    backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 }
                  }
                },
                fields: 'userEnteredFormat(textFormat,backgroundColor)'
              }
            },
            {
              updateSheetProperties: {
                properties: {
                  sheetId: newSheetId,
                  gridProperties: { frozenRowCount: 1 }
                },
                fields: 'gridProperties.frozenRowCount'
              }
            }
          ]
        }
      });
      console.log(`  Formatting applied`);
    }

    // Get final sheet info with gids
    const finalInfo = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    });

    console.log('\n=== SPREADSHEET INFO ===');
    console.log(`Spreadsheet ID: ${SPREADSHEET_ID}`);
    console.log(`Web URL: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);
    console.log('\nTabs and GIDs:');

    const gidMap = {};
    for (const sheet of finalInfo.data.sheets) {
      const title = sheet.properties.title;
      const gid = sheet.properties.sheetId;
      gidMap[title] = gid;
      console.log(`  ${title}: gid=${gid}`);
    }

    // Generate CSV URLs (need published spreadsheet ID)
    console.log('\n=== IMPORTANT: PUBLISHING REQUIRED ===');
    console.log('To get CSV URLs, you need to:');
    console.log('1. Open the spreadsheet in a browser');
    console.log('2. Go to File > Share > Publish to web');
    console.log('3. Select each tab and publish as CSV');
    console.log('4. The published URLs will use the same gid values shown above');
    console.log('\nThe existing business sheet uses this published URL format:');
    console.log('https://docs.google.com/spreadsheets/d/e/[PUBLISH_ID]/pub?gid=[GID]&single=true&output=csv');

    // Output the gid values for setting up Netlify env vars later
    console.log('\n=== GID VALUES FOR NEW TABS ===');
    for (const tab of COMMUNITY_TABS) {
      if (gidMap[tab.name]) {
        console.log(`${tab.name}: ${gidMap[tab.name]}`);
      }
    }

    console.log('\nDone!');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

main();
