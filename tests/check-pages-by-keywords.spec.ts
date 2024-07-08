import { test } from '@playwright/test';
import { keywords, urls } from './data';
import { SearchResult, saveResultsToFile } from './utils';

test('Check websites by keywords', async ({ page }) => {
    const results: Map<string, SearchResult[]> = new Map();

    for (const keyword of keywords) {
        results.set(keyword, []);
    }

    for (const url of urls) {
        await page.goto(url);
        for (const keyword of keywords) {
            const headers = await findHeadersByText(page, keyword);

            for (const header of headers) {
                const { headerText, link } = await extractHeaderInfo(header, url);
                results.get(keyword)?.push({ headerText, link });
            }
        }
        await findLinksInAnchors(page, results, url);
    }
    saveResultsToFile(results);
});

async function findHeadersByText(page: any, keyword: string) {
    return await page.locator(`h1, h2, h3, h4, h5, h6`).filter({ hasText: keyword }).all();
}

async function extractHeaderInfo(header: any, url: string) {
    const headerText = await header.textContent();
    let link = url;

    const parentElement = await header.elementHandle();
    if (parentElement) {
        const href = await parentElement.evaluate((node: any) => {
            const parentLink = node.closest('a');
            return parentLink ? parentLink.getAttribute('href') : null;
        });
        if (href) {
            link = new URL(href, url).toString();
        }
    }
    return { headerText: headerText?.trim(), link };
}

async function findLinksInAnchors(page: any, results: Map<string, SearchResult[]>, url: string) {
    const linksInAnchors = await page.locator('a').all();
    for (const anchor of linksInAnchors) {
        const anchorText = await anchor.textContent();
        const href = await anchor.getAttribute('href');
        if (href) {
            for (const keyword of keywords) {
                if (anchorText?.includes(keyword)) {
                    results.get(keyword)?.push({ headerText: anchorText.trim(), link: new URL(href, url).toString() });
                }
            }
        }
    }
}
