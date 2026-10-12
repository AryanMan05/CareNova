// Module F: CareNova AI Health Assistant
// Clean, friendly, multi-turn conversational AI with context toggles, loading states, and suggestions
// Lead Architect: Aryan More

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHealthData } from '../context/HealthDataContext';
import { askCareNovaAI, ChatHistoryMessage } from '../services/aiAssistant';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  isFallback?: boolean;
  timestamp: string;
}

export const AIAssistant: React.FC = () => {
  const { profile } = useAuth();
  const { getLatestWeight, getLatestBloodPressure, medications } = useHealthData();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${profile?.full_name ? profile.full_name.split(' ')[0] : 'friend'}! I am **CareNova AI**, your friendly personal health assistant.\n\nYou can ask me anything about healthy eating, improving sleep, staying active, understanding blood pressure or sugar readings, or general wellness habits in simple, everyday English.\n\n*How can I help you feel your best today?*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [includeContext, setIncludeContext] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Build chat history for conversational awareness
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
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden animate-fadeIn">
      {/* Assistant Header */}
      <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <span>CareNova Health Assistant</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            </h2>
            <p className="text-xs text-stone-500">Everyday wellness insights in friendly, simple English</p>
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeContext}
              onChange={(e) => setIncludeContext(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-stone-300 focus:ring-indigo-500"
            />
            <span className="text-xs font-semibold text-stone-700">Use My Health Context</span>
          </label>

          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
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
                  isUser ? 'bg-stone-800 text-white' : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-stone-50 border border-stone-100 text-stone-800 whitespace-pre-line'
                }`}
              >
                {msg.text}
                <div
                  className={`mt-2 text-[10px] ${
                    isUser ? 'text-indigo-200 text-right' : 'text-stone-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 mr-auto items-center text-xs text-stone-500 p-3 bg-stone-50 rounded-2xl border border-stone-100">
            <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center animate-spin">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span>CareNova AI is thinking and writing your answer...</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Question Suggestions */}
      {messages.length <= 2 && (
        <div className="px-6 py-2 border-t border-stone-100 bg-stone-50/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-semibold text-stone-400 shrink-0">Try asking:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1 rounded-full bg-white border border-stone-200/80 text-[11px] text-stone-600 hover:text-indigo-600 hover:border-indigo-200 whitespace-nowrap transition-colors shadow-2xs"
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
        className="p-4 border-t border-stone-100 bg-white"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask about healthy habits, sleep, water, food, or vital readings..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 disabled:opacity-40 transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </div>

        <div className="mt-2 text-[10px] text-stone-400 flex items-center justify-between px-1">
          <span>Friendly health guidance only. Always consult a healthcare professional for diagnosis.</span>
          <span>CareNova by Aryan More</span>
        </div>
      </form>
    </div>
  );
};
