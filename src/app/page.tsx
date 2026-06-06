"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, AlertCircle, Loader2 } from 'lucide-react';
import { Role } from '@/types/chat';

interface UIMessage {
  id: string;
  sender: Role;
  text: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the container whenever messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Defensive Input Validation: Prevent empty or whitespace-only messages
    const trimmedMessage = input.trim();
    if (!trimmedMessage || isLoading) return;

    // Clear previous errors on a new attempt
    setErrorMessage(null);

    // Append user message immediately to the UI state
    const userMessageId = crypto.randomUUID();
    const newUserMessage: UIMessage = {
      id: userMessageId,
      sender: 'user',
      text: trimmedMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Execute the request to our Next.js API endpoint
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedMessage,
          sessionId: sessionId || undefined, // Send sessionId if it exists
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to receive a response from the support server.');
      }

      // Track the session token across subsequent requests
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      // Append AI response to the UI state
      const aiMessage: UIMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (err: any) {
      console.error('Frontend Communication Error:', err);
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-between min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      {/* Container Card */}
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-md flex flex-col h-[85vh] overflow-hidden">
        
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-emerald-400">
              <Bot size={24} />
            </div>
            <div>
              <h1 className="font-semibold text-base leading-tight">Agent01 Support</h1>
              <p className="text-xs text-slate-400">Automated Assistant</p>
            </div>
          </div>
          {sessionId && (
            <span className="text-[10px] tracking-wider uppercase font-mono px-2 py-1 bg-slate-800 rounded text-slate-400">
              ID: {sessionId.slice(0, 8)}...
            </span>
          )}
        </header>

        {/* Conversation Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
              <div className="p-4 bg-white border border-slate-200 rounded-full text-slate-400 shadow-sm">
                <Bot size={32} />
              </div>
              <div className="max-w-sm">
                <p className="text-sm font-medium text-slate-700">Welcome to Agent01 Store Support!</p>
                <p className="text-xs text-slate-500 mt-1">
                  Ask me anything about our shipping methods, return windows, or business operating hours.
                </p>
              </div>
            </div>
          )}

          {/* Render Active Message Threads */}
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div key={msg.id} className={`flex w-full items-start gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}>
                {isAI && (
                  <div className="p-1.5 bg-slate-900 rounded-lg text-white mt-1 shrink-0">
                    <Bot size={16} />
                  </div>
                )}
                
                <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm shadow-sm border ${
                  isAI 
                    ? 'bg-white border-slate-200 text-slate-800' 
                    : 'bg-slate-900 border-slate-900 text-white'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>

                {!isAI && (
                  <div className="p-1.5 bg-slate-200 rounded-lg text-slate-700 mt-1 shrink-0 border border-slate-300">
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Inline Loading / Typing State */}
          {isLoading && (
            <div className="flex w-full items-start gap-3 justify-start">
              <div className="p-1.5 bg-slate-900 rounded-lg text-white mt-1 shrink-0 animate-pulse">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-2 text-slate-500 shadow-sm">
                <Loader2 size={14} className="animate-spin text-slate-400" />
                <span className="text-xs font-medium">Agent is composing a reply...</span>
              </div>
            </div>
          )}

          {/* Error Alert Display Box */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <p className="flex-1">{errorMessage}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Interactive Panel */}
        <footer className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Ask about shipping, hours, or returns..."
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition disabled:bg-slate-100 disabled:text-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2.5 bg-slate-900 text-white border border-slate-900 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition hover:bg-slate-800 cursor:pointer active:scale-95 disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400 disabled:scale-100"
            >
              <Send size={16} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </footer>

      </div>
    </main>
  );
}
