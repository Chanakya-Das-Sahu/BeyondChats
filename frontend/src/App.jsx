import React, { useState } from 'react';
import { Search, Sparkles, Link as LinkIcon, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
const ArticleDashboard = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refiningId, setRefiningId] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Phase 1: Fetch from your existing endpoint
  const fetchOriginals = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/fetchFromBeyond');
      console.log('response', response.data);
      setArticles(response.data.data);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Phase 2: Trigger the Node.js Optimization script
  const handleRefine = async (article) => {
    setRefiningId(article.link); // Using link as temporary ID
    try {
      // This calls your Phase 2 Node.js route
      const response = await fetch('http://localhost:3000/refine-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article),
      });
      const updatedData = await response.json();
      setSelectedArticle(updatedData); // Show refined version in UI
    } catch (error) {
      alert("Refinement failed. Ensure Node.js script is running.");
    } finally {
      setRefiningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-indigo-900">Blog Content Optimizer</h1>
          <p className="text-gray-500">Scrape, Analyze, and Outrank Competitors</p>
        </div>
        <button 
          onClick={fetchOriginals}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
          Fetch Original Blogs
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Original Articles (List) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <CheckCircle className="text-green-500" /> Scraped Articles ({articles.length})
          </h2>
          {articles.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-300 transition-colors">
              <h3 className="font-bold text-lg mb-2 leading-tight">{item.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-3 mb-4">{item.description}</p>
              <div className="flex justify-between items-center">
                <a href={item.link} target="_blank" className="text-indigo-600 text-xs flex items-center gap-1 hover:underline">
                  <LinkIcon size={14} /> View Original
                </a>
                <button 
                  onClick={() => handleRefine(item)}
                  disabled={refiningId === item.link}
                  className="flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-100 transition-colors"
                >
                  {refiningId === item.link ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  Refine for SEO
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Comparison / Refined View */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl min-h-[600px] overflow-hidden sticky top-6">
            <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
              <span className="text-sm font-medium uppercase tracking-widest opacity-70">AI Enhanced Version</span>
              {selectedArticle && <span className="bg-green-500 text-[10px] px-2 py-1 rounded">READY</span>}
            </div>
            
            <div className="p-8">
              {!selectedArticle ? (
                <div className="flex flex-col items-center justify-center h-[500px] text-gray-400">
                  <Sparkles size={48} className="mb-4 opacity-20" />
                  <p>Select an article to see the AI-refined SEO version</p>
                </div>
              ) : (
                <article className="prose prose-indigo max-w-none">
                  <h1 className="text-3xl font-extrabold mb-6">{selectedArticle.updatedTitle}</h1>
                  <div className="text-gray-700 leading-relaxed space-y-4">
                    {/* Render HTML content from LLM */}
                    <div dangerouslySetInnerHTML={{ __html: selectedArticle.updatedContent }} />
                  </div>
                  
                  <div className="mt-12 pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-500 mb-3">SEO REFERENCE SOURCES:</h4>
                    <ul className="space-y-2">
                      {selectedArticle.references.map((ref, i) => (
                        <li key={i} className="text-xs text-indigo-500 hover:underline">
                          <a href={ref} target="_blank">{ref}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ArticleDashboard;