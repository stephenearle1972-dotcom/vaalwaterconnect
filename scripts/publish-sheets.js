/**
 * Script to make the Vaalwater spreadsheet publicly accessible
 * and verify CSV access for all tabs
 */

import { google } from 'googleapis';
import fs from 'fs';

const CREDENTIALS_PATH = 'F:\\My Drive\\TOWN CONNECT\\google-sheets-credentials.json.json';
const SPREADSHEET_ID = '1b_O-Xe8LGFjvAiHgskwJ-LVR6AbxN0fQL76pULg1CiI';

// The publish ID from the existing working URL
const PUBLISH_ID = '2PACX-1vThi_KiXMZnzjFDN4dbCz8xPTlB8dJnal9NRMd-_8p2hg6000li5r1bhl5cRugFQyTopHCzHVtGc9VN';

const TABS = {
  'vaalwater_business_listings_LIVE': 246270252,
  'Events': 876534596,
  'Jobs': 244810373,
  'Classifieds': 838063881,
  'Property': 507713957,
  'Notices': 1863055530
};

async function main() {
  try {
    console.log('Loading credentials...');
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
      ]
    });

    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // Check current sharing settings
    console.log('\nChecking current sharing settings...');
    const file = await drive.files.get({
      fileId: SPREADSHEET_ID,
      fields: 'id, name, permissions'
    });
    console.log('File:', file.data.name);

    // List current permissions
    const permissions = await drive.permissions.list({
      fileId: SPREADSHEET_ID,
      fields: 'permissions(id, type, role, emailAddress)'
    });
    console.log('Current permissions:', permissions.data.permissions);

    // Make the file publicly accessible (anyone with link can view)
    console.log('\nMaking spreadsheet publicly accessible...');
    try {
      await drive.permissions.create({
        fileId: SPREADSHEET_ID,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });
      console.log('Public access granted!');
    } catch (e) {
      if (e.message.includes('already has')) {
        console.log('Public access already exists');
      } else {
        throw e;
      }
    }

    // Test fetching data for each tab using API
    console.log('\n=== Testing data access for each tab ===');
    for (const [tabName, gid] of Object.entries(TABS)) {
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `${tabName}!A1:Z2`
        });
        const rows = response.data.values || [];
        console.log(`${tabName}: ${rows.length > 0 ? 'OK - Headers: ' + (rows[0] ? rows[0].slice(0, 3).join(', ') + '...' : 'empty') : 'Empty'}`);
      } catch (e) {
        console.log(`${tabName}: ERROR - ${e.message}`);
      }
    }

    // Output the CSV URLs using the existing publish ID
    console.log('\n=== CSV URLs (using existing publish ID) ===');
    console.log('These URLs should work if the entire document is published:\n');

    const baseUrl = `https://docs.google.com/spreadsheets/d/e/${PUBLISH_ID}/pub`;
    for (const [tabName, gid] of Object.entries(TABS)) {
      const url = `${baseUrl}?gid=${gid}&single=true&output=csv`;
      console.log(`${tabName}:`);
      console.log(`  ${url}\n`);
    }

    // Alternative: Use gviz/tq endpoint which works with publicly shared sheets
    console.log('\n=== Alternative URLs (using gviz/tq - works with public sheets) ===');
    console.log('These URLs work if the sheet is shared "Anyone with the link":\n');

    for (const [tabName, gid] of Object.entries(TABS)) {
      const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${gid}`;
      console.log(`${tabName}:`);
      console.log(`  ${url}\n`);
    }

    console.log('\n=== Netlify Environment Variables ===');
    console.log('Add these to your Netlify site:\n');

    // Using the gviz/tq URLs which work with public sheets
    const envVars = {
      'VITE_EVENTS_CSV_URL': `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${TABS['Events']}`,
      'VITE_JOBS_CSV_URL': `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${TABS['Jobs']}`,
      'VITE_CLASSIFIEDS_CSV_URL': `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${TABS['Classifieds']}`,
      'VITE_PROPERTY_CSV_URL': `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${TABS['Property']}`,
      'VITE_NOTICES_CSV_URL': `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${TABS['Notices']}`
    };

    for (const [key, value] of Object.entries(envVars)) {
      console.log(`${key}=${value}`);
    }

    console.log('\nDone!');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

main();
