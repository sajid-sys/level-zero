import React, { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';
import type { OptimizeEnergyRequest, OptimizeEnergyResponse } from '../types/energy';

interface RawJsonViewerProps {
  request: OptimizeEnergyRequest;
  response: OptimizeEnergyResponse | null;
}

export const RawJsonViewer: React.FC<RawJsonViewerProps> = ({ request, response }) => {
  const [activeTab, setActiveTab] = useState<'request' | 'response'>('response');
  const [copied, setCopied] = useState(false);

  const activeContent = activeTab === 'request' ? request : response;
  const jsonStr = activeContent ? JSON.stringify(activeContent, null, 2) : 'No response yet.';

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center space-x-2">
          <Code className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Raw JSON Inspector
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-slate-100 p-0.5 rounded-lg flex text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('request')}
              className={`px-3 py-1 rounded-md transition ${
                activeTab === 'request' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Request JSON
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('response')}
              className={`px-3 py-1 rounded-md transition ${
                activeTab === 'response' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Response JSON
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-auto max-h-80 leading-relaxed">
        {jsonStr}
      </pre>
    </div>
  );
};
