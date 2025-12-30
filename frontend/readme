========================================================================
             FRONTEND UI - CONTENTGENIUS AI DASHBOARD
========================================================================

1. SETUP INSTRUCTIONS
------------------------------------------------------------------------
Step 1: Navigate to the directory
        > cd frontend

Step 2: Install dependencies
        > npm install

Step 3: create .env 
        
        create VITE_ENV='/dev' 
        to access development backend server otherwise it will access cloud backend server

Step 3: Development Server
        > npm run dev


2. CORE FUNCTIONALITY
------------------------------------------------------------------------

FEATURE 1: Article Fetching
--------------------------------------------------
Function:    fetchOriginals()
Action:      Calls GET /fetchFromBeyond.
Behavior:    Populates the left-hand sidebar with the 5 oldest 
             articles from BeyondChats.


FEATURE 2: AI Refinement (Gemini Integration)
--------------------------------------------------
Function:    handleRefine(article)
Action:      Sends raw title/desc to POST /refine-article.
Processing:  Converts AI Markdown response into clean HTML using 
             the 'marked' library.
Display:     Shows SEO title, body, and competitor source links.


FEATURE 3: Database Sync
--------------------------------------------------
Function:    handleSave()
Action:      Sends the refined content to POST /save-refined.
Identifier:  Uses the article 'link' as the unique key.
Feedback:    Triggers 'react-hot-toast' notifications on success.


3. TECHNICAL STACK
------------------------------------------------------------------------
* UI Library:  React.js
* Styling:    Tailwind CSS (Modern, Responsive Design)
* Icons:      Lucide-React
* HTTP Client: Axios
* Parsing:    Marked (Markdown to HTML)
* Utilities:  Custom 'getServerOrigin' for flexible API base URLs


4. COMPONENT STRUCTURE
------------------------------------------------------------------------
[ Header ] -> Brand Title & Global Fetch Button
    |
[  Main  ] -> Left Col:  Scrollable feed of raw articles
    |
    --------> Right Col: Sticky AI Previewer & Firestore Save tool


========================================================================
Generated on: 2025-12-30
========================================================================