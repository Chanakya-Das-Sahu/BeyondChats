import React from 'react';
import { X, Calendar, Link as LinkIcon, ExternalLink, FileText } from 'lucide-react';
import { marked } from 'marked';
const ArticleModal = ({ isOpen, onClose, article }) => {
  if (!isOpen || !article) return null;
console.log('article',article)
  // Handle clicking outside the modal to close
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <FileText size={20} />
            <span className="font-bold uppercase tracking-wider text-xs">Article Details</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content (Scrollable) */}
        <div className="p-8 overflow-y-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4 leading-tight">
            {article.title}
          </h2>

          <div className="flex flex-wrap gap-4 mb-8 text-sm text-slate-500">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg">
              <Calendar size={14} />
              <span>Scraped at: {article.scrapedAt || "Recently"}</span>
            </div>
            <a 
              href={article.link} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <ExternalLink size={14} />
              <span>View Source</span>
            </a>
          </div>

          <div className="prose prose-slate max-w-none">
            <h4 className="text-slate-400 uppercase text-[10px] font-black tracking-widest mb-[-10px]">Description</h4><br/>
             <div dangerouslySetInnerHTML={{__html: marked.parse(article.content)}}/>
          </div>

          {/* Other Sources / References */}
          {article.sources && article.sources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                Other Sources
              </h4>
              <div className="space-y-2">
                {article.sources.map((src, idx) => (
                  <a 
                    key={idx} 
                    href={src} 
                    className="flex items-center gap-2 text-sm text-indigo-500 hover:underline"
                  >
                    <LinkIcon size={14} />
                    {src}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;