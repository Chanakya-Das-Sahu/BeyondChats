const axios = require('axios');
const cheerio = require('cheerio');

async function getFiveOldestDetailed() {
    const baseUrl = "https://beyondchats.com/blogs/";
    let articleLinks = [];

    try {
        console.log("Fetching the 5 oldest article links...");
        const pagesToScrape = [15, 14];

        for (let pageNum of pagesToScrape) {
            const res = await axios.get(`${baseUrl}page/${pageNum}/`);
            const $ = cheerio.load(res.data);
            $('article').each((_, el) => {
                const title = $(el).find('h2, h3').first().text().trim();
                const link = $(el).find('a').attr('href');
                if (title && link) articleLinks.push({ title, link });
            });
        }

        const finalArticles = articleLinks.reverse().slice(0, 5);
        console.log("\n--- SCRAPING DETAILED DESCRIPTIONS ---\n");

        for (let i = 0; i < finalArticles.length; i++) {
            const articlePage = await axios.get(finalArticles[i].link);
            const $art = cheerio.load(articlePage.data);
            
            // 1. Target multiple possible content containers
            // 2. Map paragraphs and filter out empty ones
            // 3. Join the first 3 paragraphs to ensure it's not too short
            const description = $art('.entry-content p, .post-content p, .ast-single-post-content p')
                .map((_, el) => $art(el).text().trim())
                .get()
                .filter(text => text.length > 20) // Ignore very short snippets
                .slice(0, 3) // Get 3 paragraphs instead of 1
                .join(' ');

            console.log(`[${i + 1}] TITLE: ${finalArticles[i].title}`);
            console.log(`    DESC:  ${description || "Content found but needs custom selector for this post type."}`);
            console.log(`    LINK:  ${finalArticles[i].link}\n`);
            console.log('-------------------------------------------');
        }

    } catch (error) {
        console.error("Error:", error.message);
    }
}

getFiveOldestDetailed();