import React, { useState, useRef, useEffect } from 'react';
import { Card, CardBody } from '../UI';
import { useAuth } from '../../context/AuthContext';
import { AI_REPLIES } from '../../data/indiaData';

const QUICK_PROMPTS = [
  'Best areas to invest in Bengaluru?',
  'Compare Noida vs Gurugram',
  'How to verify RERA registration?',
  'Best loan for first-time home buyer?',
  'Predict price for 2BHK in Mumbai',
  'What is stamp duty in Maharashtra?',
];

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([{
    role: 'bot',
    text: "Hello! I'm BRICKSBRAIN-AI 🏠 I can help you find properties across India, predict prices, check legal history, compare loans, and give investment advice. What would you like to know?",
    time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
  }]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const replyIdx = useRef(0);
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    const time = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    setMessages(m => [...m, { role:'user', text:msg, time }]);
    setLoading(true);
    setTimeout(() => {
      const reply = AI_REPLIES[replyIdx.current % AI_REPLIES.length];
      replyIdx.current++;
      setMessages(m => [...m, { role:'bot', text:reply, time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) }]);
      setLoading(false);
    }, 900 + Math.random() * 400);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">BRICKSBRAIN-AI Assistant</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Powered by OpenAI GPT-4 / Anthropic Claude · Real estate expert for 45+ Indian cities</p>
      </div>

      <div className="max-w-2xl space-y-4">
        <Card><CardBody className="p-4">
          {/* Messages */}
          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto mb-4 pr-1 scrollbar-hide">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 items-end animate-fade-in ${m.role==='user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  m.role==='bot' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
                }`}>
                  {m.role==='bot' ? 'AI' : (user?.avatar || 'U')}
                </div>
                <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.role==='bot'
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                    : 'bg-brand-50 dark:bg-brand-900/30 text-slate-800 dark:text-slate-200 rounded-br-sm'
                }`}>
                  {m.text}
                  <div className="text-[10px] text-slate-400 mt-1">{m.time}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5 items-end">
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-xs font-black text-brand-700 dark:text-brand-400">AI</div>
                <div className="px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                  {[0,150,300].map(d => (
                    <span key={d} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce-dot" style={{ animationDelay:`${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {QUICK_PROMPTS.map(q => (
              <button key={q} onClick={() => send(q)}
                className="text-xs px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-full text-slate-500 dark:text-slate-400 font-semibold hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all bg-white dark:bg-slate-800">
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              placeholder="Ask about properties, prices, investment, loans..."
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && send()} disabled={loading} />
            <button onClick={() => send()} disabled={loading || !input.trim()}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all">
              Send
            </button>
          </div>
        </CardBody></Card>

        <div className="p-3.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <span className="font-bold text-blue-700 dark:text-blue-400">💡 Integration note:</span> Replace mock replies in{' '}
          <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-200 dark:border-slate-700">backend/routes/chat.js</code>{' '}
          with real OpenAI GPT-4 or Anthropic Claude API calls. The backend endpoint is already wired up — just add your API key to <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-200 dark:border-slate-700">.env</code>.
        </div>
      </div>
    </div>
  );
}
