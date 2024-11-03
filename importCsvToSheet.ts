import { google } from 'googleapis';
import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export async function importCsvToSheet(csvFilePath: string): Promise<void> {
    const auth = await authorize();
    const sheets = google.sheets({ version: 'v4', auth });

    // Create a new spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
            properties: {
                title: 'Imported CSV Data',
            },
        },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    console.log(`Spreadsheet created with ID: ${spreadsheetId}`);

    // Read CSV data
    const csvData = fs.readFileSync(csvFilePath, 'utf8');
    const rows = csvData.split('\n').map((row) => row.split(','));

    // Append data to the spreadsheet
    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: rows,
        },
    });

    console.log('Data imported to Google Sheets successfully.');
}

async function authorize() {
    const credentialsPath = path.resolve(__dirname, 'credentials.json');
    const tokenPath = path.resolve(__dirname, 'token.json');

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    const { client_secret, client_id, redirect_uris } = credentials.installed;

    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
    );

    // Check if we have previously stored a token.
    if (fs.existsSync(tokenPath)) {
        const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
        oAuth2Client.setCredentials(token);
        return oAuth2Client;
    }

    // Get a new token
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const code = await new Promise<string>((resolve) => {
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            resolve(code);
        });
    });

    const tokenResponse = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokenResponse.tokens);

    // Store the token to disk for later program executions
    fs.writeFileSync(tokenPath, JSON.stringify(tokenResponse.tokens));

    return oAuth2Client;
}
