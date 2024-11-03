import { downloadCsv } from './downloadCsv';
import { importCsvToSheet } from './importCsvToSheet';

(async () => {
    try {
        const csvFilePath = await downloadCsv();
        console.log(`CSV downloaded at: ${csvFilePath}`);

        await importCsvToSheet(csvFilePath);
    } catch (error) {
        console.error('An error occurred:', error);
    }
})();
