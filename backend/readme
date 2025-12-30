cd backend

npm install

create .env

create and add values

FB_PROJECT_ID

FB_PRIVATE_KEY

FB_CLIENT_EMAIL

GEMINI_API_KEY

Routes we have :

1. /fetchFromBeyond (GET)
   Scrapes Data

Action: Crawls the BeyondChats blog pages.

Result: Picks the 5 oldest articles and saves their titles, links, and descriptions into a Firestore array.

2. /refine-article (POST)
   AI Processing

Action: Sends article details to Gemini AI.

Result: Returns an SEO-optimized title, markdown content, and top-ranked Google references in JSON format.

3. /save-refined (POST)
   Updates Database

Action: Finds the specific article in Firestore via its link.

Result: Overwrites the original data with the AI-refined version and sets isRefined: true.





========================================================================
             BACKEND API - BLOG SCRAPER & AI REFINER
========================================================================

1. SETUP INSTRUCTIONS
------------------------------------------------------------------------
Step 1: Navigate to the directory
        > cd backend

Step 2: Install dependencies
        > npm install

Step 3: Environment Configuration
        Create a file named '.env' in the root directory.
        Add the following keys:

        FB_PROJECT_ID    = [Your Firebase Project ID]
        FB_PRIVATE_KEY   = [Your Firebase Private Key]
        FB_CLIENT_EMAIL  = [Your Firebase Client Email]
        GEMINI_API_KEY   = [Your Gemini API Key]


2. API DOCUMENTATION
------------------------------------------------------------------------

ENDPOINT 1: [GET] /fetchFromBeyond
--------------------------------------------------
Description: Scrapes raw blog data.
Action:      Crawls the BeyondChats blog pages.
Logic:       Filters and picks the 5 oldest articles.
Database:    Saves titles, links, and descriptions into Firestore.


ENDPOINT 2: [POST] /refine-article
--------------------------------------------------
Description: AI Content Processing.
Action:      Sends article details to the Gemini AI engine.
Response:    Returns a JSON object containing:
             - SEO-optimized title
             - Full content in Markdown
             - Top-ranked Google references


ENDPOINT 3: [POST] /save-refined
--------------------------------------------------
Description: Updates Database with AI content.
Action:      Matches the article in Firestore using the 'link'.
Result:      Overwrites raw data with AI-refined content.
Flag:        Sets { isRefined: true } upon success.


3. PROJECT WORKFLOW
------------------------------------------------------------------------
[ SCRAPE ] ----> [ Firestore (Raw) ]
                      |
                      v
[ REFINE ] <---- [ Gemini AI ]
                      |
                      v
[  SAVE  ] ----> [ Firestore (Updated) ]


========================================================================
Generated on: 2025-12-30
========================================================================