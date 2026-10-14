// CareNova AI Health Assistant
// Clean, friendly, multi-turn conversational AI with context toggles, loading states, and suggestions
// Palette: Forest Teal (#0B343B), Deep Navy (#102D3E), Primary Teal (#168B83), Fresh Mint (#A8E6D5 / #64D8C1)
// Lead Architect: Aryan More

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Activity,
  Settings,
  CheckCircle2,
  Globe,
  ExternalLink,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHealthData } from '../context/HealthDataContext';
import { askCareNovaAI, ChatHistoryMessage } from '../services/aiAssistant';
import { api, getApiBaseUrl, setApiBaseUrl } from '../lib/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  isFallback?: boolean;
  timestamp: string;
}

export const AIAssistant: React.FC = () => {
  const { user, profile } = useAuth();
  const { getLatestWeight, getLatestBloodPressure, medications } = useHealthData();

  const firstName = profile?.full_name
    ? profile.full_name.split(' ')[0]
    : user?.full_name
    ? user.full_name.split(' ')[0]
    : 'friend';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${firstName}! I am **CareNova AI**, your friendly personal health assistant.\n\nYou can ask me anything about healthy eating, improving sleep, staying active, understanding blood pressure or sugar readings, or general wellness habits in simple, everyday English.\n\n*How can I help you feel your best today?*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [includeContext, setIncludeContext] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Backend Connection & Diagnostics State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [backendUrlInput, setBackendUrlInput] = useState(getApiBaseUrl());
  const [backendStatus, setBackendStatus] = useState<{
    checked: boolean;
    online: boolean;
    geminiConfigured: boolean;
    provider?: string;
    keyLength?: number;
    error?: string;
    checking: boolean;
  }>({
    checked: false,
    online: false,
    geminiConfigured: false,
    checking: false,
  });

  const checkBackendHealth = async () => {
    setBackendStatus((prev) => ({ ...prev, checking: true, error: undefined }));
    try {
      const res = await api.ai.getStatus();
      setBackendStatus({
        checked: true,
        online: true,
        geminiConfigured: Boolean(res?.gemini?.detected || res?.aiConfigured),
        provider: res?.provider || 'google-gemini',
        keyLength: res?.gemini?.keyLength,
        checking: false,
      });
    } catch (err: any) {
      setBackendStatus({
        checked: true,
        online: false,
        geminiConfigured: false,
        error: err?.message || 'Could not connect to backend',
        checking: false,
      });
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const handleSaveBackendUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiBaseUrl(backendUrlInput);
    await checkBackendHealth();
  };

  const quickPrompts = [
    'How can I lower my blood pressure naturally?',
    'What are simple tips to sleep better at night?',
    'How much water should I drink each day?',
    'Easy ways to keep blood sugar steady after meals',
    'How do I start a gentle 15-minute daily exercise habit?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Process **bold** and *italic*
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return (
        <div key={idx} className={line.trim() === '' ? 'h-2' : 'min-h-[1rem]'}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-[#0B343B] dark:text-white">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return (
                <em key={pIdx} className="italic text-[#168B83] dark:text-[#64D8C1]">
                  {part.slice(1, -1)}
                </em>
              );
            }
            return part;
          })}
        </div>
      );
    });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    setErrorMessage(null);

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const history: ChatHistoryMessage[] = messages
      .slice(-6)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        text: m.text,
      }));

    try {
      const response = await askCareNovaAI({
        userMessage: text,
        conversationHistory: history,
        includeContext,
        profile,
        latestWeight: getLatestWeight(),
        latestBP: getLatestBloodPressure(),
        activeMeds: medications,
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        isFallback: response.isFallback,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat AI failure:', err);
      setErrorMessage('The AI service is temporarily busy. Please try asking again in a moment.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Chat restarted! Feel free to ask me anything about your wellness, vitals, nutrition, or sleep habits.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col bg-white dark:bg-[#17363A] rounded-3xl border border-[#D8ECE7] dark:border-[#234E54] shadow-xs overflow-hidden animate-fadeIn text-[#183447] dark:text-[#EAF7F4]">
      {/* Assistant Header */}
      <div className="px-6 py-4 border-b border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#168B83] text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0B343B] dark:text-[#EAF7F4] flex items-center gap-1.5">
              <span>CareNova Health Assistant</span>
              <Sparkles className="w-3.5 h-3.5 text-[#168B83] dark:text-[#64D8C1]" />
            </h2>
            <p className="text-xs text-[#476A76] dark:text-[#A9C5C1]">Everyday wellness insights in friendly, simple English</p>
          </div>
        </div>

        {/* Options & Diagnostics */}
        <div className="flex items-center gap-2.5">
          {/* Live AI Engine Status Pill */}
          <button
            onClick={() => {
              setBackendUrlInput(getApiBaseUrl());
              setShowConfigModal(true);
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all border ${
              backendStatus.online && backendStatus.geminiConfigured
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100'
                : backendStatus.checking
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
                : backendStatus.online && !backendStatus.geminiConfigured
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 hover:bg-amber-100'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60 hover:bg-rose-100'
            }`}
            title="Click to check or configure Render backend URL"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus.online && backendStatus.geminiConfigured
                  ? 'bg-emerald-500 animate-pulse'
                  : backendStatus.checking
                  ? 'bg-amber-500 animate-ping'
                  : 'bg-rose-500'
              }`}
            />
            <span>
              {backendStatus.checking
                ? 'Connecting...'
                : backendStatus.online && backendStatus.geminiConfigured
                ? 'AI Live (Gemini)'
                : backendStatus.online && !backendStatus.geminiConfigured
                ? 'Key Missing on Render'
                : 'Backend Offline'}
            </span>
            <Settings className="w-3 h-3 opacity-60 ml-0.5" />
          </button>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeContext}
              onChange={(e) => setIncludeContext(e.target.checked)}
              className="w-4 h-4 text-[#168B83] rounded border-[#D8ECE7] dark:border-[#234E54] focus:ring-[#168B83]"
            />
            <span className="text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] hidden sm:inline">Use Context</span>
          </label>

          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-lg text-[#7E9FA8] hover:text-[#0B343B] dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-[#10434C] transition-colors"
            title="Start New Conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                  isUser
                    ? 'bg-[#0B343B] dark:bg-[#071017] text-white'
                    : 'bg-[#E0F7F1] dark:bg-[#163B38] text-[#168B83] dark:text-[#64D8C1]'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#168B83] text-white shadow-xs'
                    : 'bg-[#F7FCFA] dark:bg-[#122B2F] border border-[#D8ECE7] dark:border-[#234E54] text-[#0B343B] dark:text-[#EAF7F4] whitespace-pre-line'
                }`}
              >
                {isUser ? msg.text : renderFormattedText(msg.text)}
                <div
                  className={`mt-2 text-[10px] ${
                    isUser ? 'text-[#A8E6D5] text-right' : 'text-[#7E9FA8] dark:text-[#789B96]'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 mr-auto items-center text-xs text-[#476A76] dark:text-[#A9C5C1] p-3 bg-[#F7FCFA] dark:bg-[#122B2F] rounded-2xl border border-[#D8ECE7] dark:border-[#234E54]">
            <div className="w-6 h-6 rounded-lg bg-[#E0F7F1] dark:bg-[#163B38] text-[#168B83] dark:text-[#64D8C1] flex items-center justify-center animate-spin">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span>CareNova AI is thinking and writing your answer...</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Question Suggestions */}
      {messages.length <= 2 && (
        <div className="px-6 py-2 border-t border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA]/60 dark:bg-[#122B2F]/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-semibold text-[#7E9FA8] dark:text-[#789B96] shrink-0">Try asking:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1 rounded-full bg-white dark:bg-[#17363A] border border-[#D8ECE7] dark:border-[#234E54] text-[11px] text-[#476A76] dark:text-[#A9C5C1] hover:text-[#168B83] dark:hover:text-[#64D8C1] hover:border-[#168B83] whitespace-nowrap transition-colors shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Message Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-4 border-t border-[#D8ECE7] dark:border-[#234E54] bg-white dark:bg-[#17363A]"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask about healthy habits, sleep, water, food, or vital readings..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] placeholder-[#7E9FA8] dark:placeholder-[#789B96] text-xs outline-none focus:border-[#168B83] font-medium"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="px-4 py-2.5 rounded-xl bg-[#168B83] hover:bg-[#12726B] text-white font-semibold text-xs shadow-md shadow-[#168B83]/20 disabled:opacity-40 transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </div>

        <div className="mt-2 text-[10px] text-[#7E9FA8] dark:text-[#789B96] flex items-center justify-between px-1">
          <span>Friendly health guidance only. Always consult a healthcare professional for diagnosis.</span>
          <span>CareNova by Aryan More</span>
        </div>
      </form>

      {/* Backend Connection Diagnostics & Settings Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#17363A] rounded-2xl border border-[#D8ECE7] dark:border-[#234E54] shadow-2xl max-w-md w-full p-6 text-[#183447] dark:text-[#EAF7F4] space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8ECE7] dark:border-[#234E54] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E0F7F1] dark:bg-[#163B38] text-[#168B83] dark:text-[#64D8C1] flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B343B] dark:text-white">AI Backend Connection</h3>
                  <p className="text-[11px] text-[#7E9FA8] dark:text-[#789B96]">Verify and configure your live Render server</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-lg text-[#7E9FA8] hover:text-[#0B343B] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#10434C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Diagnostic Status Box */}
            <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${
              backendStatus.online && backendStatus.geminiConfigured
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                : backendStatus.online && !backendStatus.geminiConfigured
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    backendStatus.online && backendStatus.geminiConfigured
                      ? 'bg-emerald-500'
                      : backendStatus.online
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`} />
                  Server Status:
                </span>
                <span>
                  {backendStatus.checking
                    ? 'Testing connection...'
                    : backendStatus.online
                    ? 'Connected & Online'
                    : 'Unreachable / Sleeping'}
                </span>
              </div>

              <div className="text-[11px] space-y-1 pt-1 border-t border-black/10 dark:border-white/10">
                <div className="flex justify-between">
                  <span className="text-[#476A76] dark:text-[#A9C5C1]">Target Server:</span>
                  <span className="font-mono text-[10px] truncate max-w-[200px]" title={getApiBaseUrl() || 'http://localhost:5000'}>
                    {getApiBaseUrl() || 'http://localhost:5000 (Local)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#476A76] dark:text-[#A9C5C1]">Gemini API Key:</span>
                  <span className="font-semibold">
                    {backendStatus.geminiConfigured
                      ? `Active (${backendStatus.keyLength} chars)`
                      : backendStatus.online
                      ? 'Missing on Render'
                      : 'Unknown (Backend Offline)'}
                  </span>
                </div>
                {backendStatus.error && (
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 font-mono mt-1">
                    {backendStatus.error}
                  </p>
                )}
              </div>
            </div>

            {/* URL Configuration Form */}
            <form onSubmit={handleSaveBackendUrl} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#0B343B] dark:text-white mb-1">
                  Render Backend URL
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 absolute left-3 top-3 text-[#7E9FA8]" />
                  <input
                    type="url"
                    value={backendUrlInput}
                    onChange={(e) => setBackendUrlInput(e.target.value)}
                    placeholder="https://carenova-backend.onrender.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-xs text-[#0B343B] dark:text-white outline-none focus:border-[#168B83]"
                  />
                </div>
                <p className="text-[10px] text-[#7E9FA8] dark:text-[#789B96] mt-1">
                  Enter your live Render web service URL. It will be saved in your browser and used for all AI and health requests.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={backendStatus.checking}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#168B83] hover:bg-[#12726B] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${backendStatus.checking ? 'animate-spin' : ''}`} />
                  <span>{backendStatus.checking ? 'Testing...' : 'Save & Test Connection'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setApiBaseUrl('');
                    setBackendUrlInput('');
                    checkBackendHealth();
                  }}
                  className="py-2 px-3 rounded-xl border border-[#D8ECE7] dark:border-[#234E54] hover:bg-stone-100 dark:hover:bg-[#10434C] text-[11px] font-semibold text-[#476A76] dark:text-[#A9C5C1] transition-colors"
                >
                  Reset
                </button>
              </div>
            </form>

            {/* Quick Tips */}
            <div className="p-3 bg-stone-50 dark:bg-[#122B2F] rounded-xl border border-[#D8ECE7] dark:border-[#234E54] text-[11px] text-[#476A76] dark:text-[#A9C5C1] space-y-1">
              <p className="font-semibold text-[#0B343B] dark:text-white">Tips for Live Render Deployment:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                <li><strong>Render Free Tier Cold Start:</strong> Render spins down inactive instances. It takes 30–50s to wake up on the first request.</li>
                <li><strong>GEMINI_API_KEY:</strong> In Render Dashboard &gt; Environment Variables, add <code>GEMINI_API_KEY</code> from Google AI Studio.</li>
                <li><strong>Netlify Variable:</strong> In Netlify Dashboard &gt; Environment Variables, set <code>VITE_API_URL</code> to your Render URL.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
