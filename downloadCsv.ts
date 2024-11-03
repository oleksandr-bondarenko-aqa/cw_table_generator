import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

export async function downloadCsv(): Promise<string> {
    const browser: Browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        acceptDownloads: true,
    });
    const page: Page = await context.newPage();

    await page.goto('https://royaleapi.com/clan/QUP0RL88/war/race');

    // Click on the CSV button
    await page.click('a.button.is-small.is-primary'); // Adjust the selector if necessary

    // Handle the login if prompted (we'll skip automating Google login)
    // Instead, instruct the user to log in manually

    console.log('Please log in manually in the browser window and then press Enter here.');
    await new Promise<void>((resolve) => {
        process.stdin.once('data', () => resolve());
    });

    // Wait for the download to start
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        // Click the CSV button again after login
        page.click('a.button.is-small.is-primary'),
    ]);

    // Save the downloaded file
    const downloadPath = await download.path();
    const fileName = download.suggestedFilename();
    const savePath = path.resolve(__dirname, fileName);
    await download.saveAs(savePath);

    await browser.close();

    return savePath;
}
