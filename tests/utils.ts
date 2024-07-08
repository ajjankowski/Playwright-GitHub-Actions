import * as fs from 'fs';

export interface SearchResult {
    headerText: string;
    link: string;
}

export const saveResultsToFile = (results: Map<string, SearchResult[]>) => {
    const fileName = 'results.txt';
    let fileContent = '';

    results.forEach((searchResults, keyword) => {
        fileContent += `\n----------------------------------------\n`;
        fileContent += `Searched phrase: ${keyword}\n\n`;
        searchResults.forEach(result => {
            fileContent += `${result.headerText}\n`;
            fileContent += `${result.link}\n\n`;
        });
    });
    fs.writeFileSync(fileName, fileContent);
};
