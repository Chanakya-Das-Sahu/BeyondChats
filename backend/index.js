const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors())
// IMPORTANT: You MUST download your serviceAccountKey.json from Firebase Console
// Settings > Service Accounts > Generate New Private Key
const serviceAccount = {
  projectId: process.env.FB_PROJECT_ID,
  privateKey: process.env.FB_PRIVATE_KEY.replace(/\\n/g, '\n'),
  clientEmail: process.env.FB_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.get('/fetchFromBeyond', async (req, res) => {
    const baseUrl = "https://beyondchats.com/blogs/";
    let articleLinks = [];

    try {
        console.log("Starting scrape...");
        // 1. Get the last page numbers
        const mainRes = await axios.get(baseUrl);
        const $main = cheerio.load(mainRes.data);
        const pages = [15, 14]; // Targeting oldest pages

        for (let pageNum of pages) {
            const pageRes = await axios.get(`${baseUrl}page/${pageNum}/`);
            const $ = cheerio.load(pageRes.data);
            $('article').each((_, el) => {
                const title = $(el).find('h2, h3').first().text().trim();
                const link = $(el).find('a').attr('href');
                if (title && link) articleLinks.push({ title, link });
            });
        }

        const finalArticles = articleLinks.reverse().slice(0, 5);
        const detailedArticles = [];

        // 2. Fetch descriptions from inside the links
        for (let art of finalArticles) {
            const articlePage = await axios.get(art.link);
            const $art = cheerio.load(articlePage.data);
            const description = $art('.entry-content p, .post-content p, .ast-single-post-content p')
                .map((_, el) => $art(el).text().trim())
                .get()
                .filter(text => text.length > 20)
                .slice(0, 3)
                .join(' ');

            detailedArticles.push({
                title: art.title,
                description: description || "No description found",
                link: art.link,
                scrapedAt: new Date().toISOString()
            });
        }

        // 3. Store to Firestore using arrayUnion
        // We store all 5 articles inside a single document in a field called 'entries'
        const docRef = db.collection('blog_collection').doc('oldest_articles');
        await docRef.set({
            entries: admin.firestore.FieldValue.arrayUnion(...detailedArticles)
        }, { merge: true });

        res.status(200).json({
            message: "Successfully scraped and stored to Firestore",
            count: detailedArticles.length,
            data: detailedArticles
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error: " + error.message);
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));