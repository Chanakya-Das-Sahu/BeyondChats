const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const admin = require('firebase-admin');
const cors = require('cors');
const TurndownService = require('turndown');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const {marked} = require('marked');
require('dotenv').config();

const app = express();
app.use(cors())
app.use(express.json());

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

app.post("/save-refined", async (req, res) => {
  const { link, updatedTitle, updatedContent, references } = req.body;

  if (!link) return res.status(400).json({ error: "Original link is required" });

  try {
    const docRef = db.collection('blog_collection').doc('oldest_articles');
    const doc = await docRef.get();

    if (!doc.exists) return res.status(404).json({ error: "Document not found" });

    const data = doc.data();
    // Map through the entries to find the one matching the link and update it
    const updatedEntries = data.entries.map(article => {
      if (article.link === link) {
        return {
          ...article,
          refined_title: updatedTitle,
          refined_content: updatedContent,
          refinedAt: new Date().toISOString(),
          isRefined:true,
          ideal_references: references
        };
      }
      return article;
    });

    await docRef.update({ entries: updatedEntries });

    res.status(200).json({ message: "Saved successfully!" });
  } catch (error) {
    console.error("Save error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/refine-article", async (req, res) => {
  console.log('refinning')
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required" });
  }

  try {
    // 1. Initialize Gemini with API key from env
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 2. Get model (verified + stable)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 20000,
        responseMimeType: "application/json", // FORCE JSON
      },
    });

    // 3. Prompt
    const prompt = `
Rewrite the following article for SEO.

Title: "${title}"
Description: "${description}"

Return ONLY valid JSON in this exact format:
{
  "updatedTitle": "string",
  "updatedContent": "markdown string",
  // please include here two reference of top ranked articles on the same topic on google search 
  "references": ["url1", "url2"]
}
`;

    // 4. Generate
    const result = await model.generateContent(prompt);

    // 5. Safe text extraction
    const text = result.response.text();
const cleanedText = text.replace(/^```json|```$/g, "").trim();
    // 6. Parse JSON
    const parsed = JSON.parse(cleanedText);

    return res.json(parsed);
  } catch (error) {
    console.error("Refine article error:", error);
    return res.status(500).json({
      error: "Refinement failed",
      details: error.message,
    });
  }
});


const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '_'
});

app.get('/fetchFromBeyond', async (req, res) => {
    const baseUrl = "https://beyondchats.com/blogs/";
    let articleLinks = [];

    try {
        console.log("Starting full content scrape...");

        // 1. Get the target pages (Oldest ones)
        const pages = [15, 14]; 

        for (let pageNum of pages) {
            const pageRes = await axios.get(`${baseUrl}page/${pageNum}/`);
            const $ = cheerio.load(pageRes.data);
            
            $('article').each((_, el) => {
                const title = $(el).find('h2, h3').first().text().trim();
                const link = $(el).find('a').attr('href');
                if (title && link) articleLinks.push({ title, link });
            });
        }

        // Reverse to get oldest first, and pick the first 5
        const finalArticles = articleLinks.reverse().slice(0, 5);
        const detailedArticles = [];

        // 2. Fetch COMPLETE blog content and convert to Markdown
        for (let art of finalArticles) {
            console.log(`Scraping content for: ${art.title}`);
            const articlePage = await axios.get(art.link);
            const $art = cheerio.load(articlePage.data);

            // Target the main content container (using common Astra/WordPress classes)
            // We remove potential noise like scripts or sidebars before converting
            const contentSelector = '.entry-content, .post-content, .ast-single-post-content';
            const contentHtml = $art(contentSelector).html();

            let markdownContent = "No content found";
            if (contentHtml) {
                // This converts the HTML (with bold, lists, links) into clean Markdown text
                markdownContent = turndownService.turndown(contentHtml);
            }

            detailedArticles.push({
                title: art.title,
                content: markdownContent, // Full text with formatting
                link: art.link,
                scrapedAt: new Date().toISOString()
            });
        }

        // 3. Store to Firestore
        // Note: Full blogs can be large. If you exceed 1MB, this doc write will fail.
        const docRef = db.collection('blog_collection').doc('oldest_articles');
        
        await docRef.set({
            entries: admin.firestore.FieldValue.arrayUnion(...detailedArticles)
        }, { merge: true });

        res.status(200).json({
            message: "Successfully scraped full blogs and stored to Firestore",
            count: detailedArticles.length,
            data: detailedArticles
        });

    } catch (error) {
        console.error("Scraping Error:", error);
        res.status(500).send("Error: " + error.message);
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));