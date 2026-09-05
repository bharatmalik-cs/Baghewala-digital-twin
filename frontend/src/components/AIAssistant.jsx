import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, HelpCircle } from 'lucide-react';
import { sendChatMessage } from '../services/api';

export const AIAssistant = ({ activeWellId }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello! I am your Baghewala Field Digital Twin Operations Assistant. I am monitoring well **${activeWellId}**. How can I assist with CSS thermal stimulation or SRP Dynacard diagnostics today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    const res = await sendChatMessage(activeWellId, query);
    setLoading(false);

    if (res && res.response) {
      setMessages((prev) => [...prev, { sender: 'bot', text: res.response }]);
    } else {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: "Sorry, I couldn't connect to the Digital Twin Assistant backend." }
      ]);
    }
  };

  const quickPrompts = [
    `How to fix Fluid Pound on ${activeWellId}?`,
    `Recommend CSS Soak Time for ${activeWellId}`,
    `Explain Steam-Oil Ratio (cSOR) optimization`,
    `Project daily profit gain with AI SPM control`
  ];

  return (
    <div className="glass-panel p-4 flex flex-col h-full relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            DIGITAL TWIN AI FIELD ASSISTANT ({activeWellId})
          </h2>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
          <Sparkles className="w-3 h-3" /> Live Twin Context
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[220px] max-h-[300px] mb-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'bot' && (
              <div className="p-1.5 bg-cyan-500/20 text-cyan-300 rounded-lg shrink-0 h-fit mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`p-3 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-100 font-medium'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 shadow'
              }`}
            >
              {m.text}
            </div>
            {m.sender === 'user' && (
              <div className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg shrink-0 h-fit mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 text-xs text-slate-400 animate-pulse">
            <Bot className="w-4 h-4 text-cyan-400" /> Analyzing reservoir physics & telemetry...
          </div>
        )}
      </div>

      {/* Quick Prompt Pills */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp)}
            className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-cyan-500/50 px-2 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1"
          >
            <HelpCircle className="w-3 h-3 text-cyan-400" /> {qp}
          </button>
        ))}
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask Baghewala AI Assistant about ${activeWellId}...`}
          className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500/80 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none transition-all"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg font-bold transition-all disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
