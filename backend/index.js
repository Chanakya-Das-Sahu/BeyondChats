const axios = require('axios');
const cheerio = require('cheerio');

async function getFiveOldest() {
    const baseUrl = "https://beyondchats.com/blogs/";
    let articles = [];

    try {
        // 1. Get the last page number
        const firstPageResponse = await axios.get(baseUrl);
        const $main = cheerio.load(firstPageResponse.data);
        const pages = [];
        $main('.page-numbers').each((_, el) => {
            const num = parseInt($main(el).text());
            if (!isNaN(num)) pages.push(num);
        });
        
        let currentPageNum = Math.max(...pages);

        // 2. Loop backwards through pages until we have 5 articles
        while (articles.length < 5 && currentPageNum > 0) {
            const pageUrl = `${baseUrl}page/${currentPageNum}/`;
            console.log(`Fetching from: ${pageUrl}`);
            
            const response = await axios.get(pageUrl);
            const $ = cheerio.load(response.data);
            
            const pageArticles = [];
            $('article, .post').each((_, element) => {
                const title = $(element).find('h1, h2, h3').first().text().trim();
                const description = $(element).find('p').first().text().trim();
                const link = $(element).find('a').attr('href');
                if (title && link) pageArticles.push({ title, description, link });
            });

            // Since we want oldest first, we add the current page's articles 
            // to the beginning of our list as we move backwards
            articles = [...pageArticles.reverse(), ...articles];
            currentPageNum--;
        }

        // 3. Keep only the first 5 (which are the oldest)
        const finalFive = articles.slice(0, 5);

        console.log(`\n--- FOUND ${finalFive.length} OLDEST ARTICLES ---\n`);
        finalFive.forEach((art, i) => {
            console.log(`[${i + 1}] TITLE: ${art.title}`);
            console.log(`    LINK:  ${art.link}\n`);
        });

    } catch (error) {
        console.error("Error:", error.message);
    }
}

getFiveOldest();