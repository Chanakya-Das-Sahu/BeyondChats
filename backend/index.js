const axios = require('axios');
const cheerio = require('cheerio');

async function getFiveOldestWithDesc() {
    const baseUrl = "https://beyondchats.com/blogs/";
    let articleLinks = [];

    try {
        console.log("Fetching the 5 oldest article links...");
        
        // 1. Target Page 15 and 14 specifically to get the oldest ones
        const pagesToScrape = [15, 14];

        for (let pageNum of pagesToScrape) {
            const res = await axios.get(`${baseUrl}page/${pageNum}/`);
            const $ = cheerio.load(res.data);
            
            // Collect titles and links from the current page
            $('article').each((_, el) => {
                const title = $(el).find('h2, h3').first().text().trim();
                const link = $(el).find('a').attr('href');
                if (title && link) {
                    articleLinks.push({ title, link });
                }
            });
        }

        // 2. Reverse and take the first 5 (absolute oldest)
        const finalArticles = articleLinks.reverse().slice(0, 5);

        console.log("\n--- SCRAPING DESCRIPTIONS FROM LINKS ---\n");

        // 3. Nested loop: Visit each link to get the description
        for (let i = 0; i < finalArticles.length; i++) {
            const articlePage = await axios.get(finalArticles[i].link);
            const $art = cheerio.load(articlePage.data);
            
            // Get the first few paragraphs as the description
            const description = $art('.entry-content p, .post-content p').first().text().trim();

            console.log(`[${i + 1}] TITLE: ${finalArticles[i].title}`);
            console.log(`    DESC:  ${description}`);
            console.log(`    LINK:  ${finalArticles[i].link}\n`);
            console.log('-------------------------------------------');
        }

    } catch (error) {
        console.error("Error:", error.message);
    }
}

getFiveOldestWithDesc();