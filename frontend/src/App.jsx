import React, { useState } from 'react';
import { Search, Sparkles, Link as LinkIcon, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import axios from 'axios';
import {marked } from 'marked';

const ArticleDashboard = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refiningId, setRefiningId] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const fetchOriginals = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/fetchFromBeyond');
      setArticles(response.data.data);
    } catch (error) {
      console.error("Fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

const handleRefine = async (article) => {
  // 1. Start loading state for the specific article
  setRefiningId(article.link);

  try {
    // 2. Prepare the payload exactly as your Node.js route expects it
    const payload = {
      title: article.title,
      description: article.description,
    };

    // 3. Make the POST request to your backend
    // Replace '/refine-article' with your full URL if the backend is on a different port
    const response = await axios.post('http://localhost:3000/refine-article', payload);

    // 4. Axios automatically parses the JSON, so 'response.data' is your final object
    const refinedData = response.data;

    // 5. Update your React state with the new SEO title, content, and references
    setSelectedArticle({
      ...article, // Keep original data like links or images
      title: refinedData.updatedTitle,
      content: marked.parse(refinedData.updatedContent),
      references: refinedData.references || []
    });

  } catch (error) {
    console.error("Frontend Refinement Error:", error);
    
    // Check for specific error status from your Node.js route
    if (error.response?.status === 500) {
      alert("The AI failed to rewrite the article. Please try again.");
    } else {
      alert("Network error: Could not reach the optimization server.");
    }
  } finally {
    // 6. Stop loading state
    setRefiningId(null);
  }
};

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">ContentGenius AI</h1>
          <p className="text-slate-500 mt-1 text-lg">Outrank competitors with AI-powered SEO refinement.</p>
        </div>
        <button 
          onClick={fetchOriginals}
          disabled={loading}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:bg-indigo-300"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search size={22} />}
          Fetch From BeyondChats
        </button>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Original Feed */}
        <section className="lg:col-span-4 space-y-6">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Original Articles</h2>
          {articles.map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:shadow-md transition-shadow">
              <h3 className="font-bold text-slate-900 mb-3 text-lg leading-snug">{item.title}</h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-6">{item.description}</p>
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => handleRefine(item)}
                  disabled={refiningId === item.link}
                  className="bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-600 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {refiningId === item.link ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                  OPTIMIZE
                </button>
                <a href={item.link} target="_blank" className="text-slate-400 hover:text-indigo-600 transition-colors"><ExternalLink size={18} /></a>
              </div>
            </div>
          ))}
        </section>

        {/* Right: Refined Output */}
        <section className="lg:col-span-8">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl min-h-[700px] sticky top-8 overflow-hidden">
            <div className="bg-slate-900 p-6 flex items-center justify-between">
              <span className="text-indigo-400 font-mono text-xs font-bold tracking-[0.3em] uppercase">AI Content Engine</span>
              {selectedArticle && <span className="text-emerald-400 text-xs font-bold flex items-center gap-1"><CheckCircle size={14}/> OPTIMIZED</span>}
            </div>

            <div className="p-8 md:p-12">
              {!selectedArticle ? (
                <div className="flex flex-col items-center justify-center h-[500px] text-slate-300">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Sparkles size={32} className="text-slate-200" />
                  </div>
                  <p className="text-lg font-medium">Select an article to begin refinement</p>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <h1 className="text-4xl font-extrabold text-slate-900 mb-8 leading-tight">{selectedArticle.title}</h1>
                  
                  {/* IMPORTANT: This renders the HTML generated by Gemini */}
                  <div 
                    className="prose prose-slate prose-lg max-w-none text-slate-700"
                    dangerouslySetInnerHTML={{ __html: selectedArticle.content }} 
                  />

                  <div className="mt-16 pt-8 border-t border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Competitor References (SEO Source)</h4>
                    <div className="flex flex-wrap gap-3">
                      {selectedArticle.references.map((ref, i) => (
                        <a key={i} href={ref} target="_blank" className="bg-slate-50 border border-slate-200 text-slate-500 px-4 py-2 rounded-full text-xs hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center gap-2">
                          <LinkIcon size={12} /> {new URL(ref).hostname}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ArticleDashboard;