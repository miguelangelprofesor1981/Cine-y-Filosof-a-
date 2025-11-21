
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import * as GeminiService from '../services/geminiService';
import { Chat } from '@google/genai';

const RoboSocrates: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'model', text: '¡Hola! ¿Qué tal? Soy tu profe de filosofía. ¿Qué te anda dando vueltas por la cabeza hoy? Hablemos sin miedo.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatSessionRef.current = GeminiService.createRoboSocratesChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !chatSessionRef.current) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      const responseText = result.text || "Che, me quedé pensando y no sé qué decirte...";
      
      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
      setMessages(prev => [...prev, botMsg]);
      
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Uhh, se me colgó el pensamiento. Probá de nuevo." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[600px] flex flex-col bg-black border-4 border-cyan-500 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.3)] animate-in zoom-in-95 duration-300 relative">
      {/* Chat Header */}
      <div className="bg-cyan-900/30 p-4 border-b border-cyan-500 flex items-center gap-3">
        <div className="bg-cyan-500 p-2 rounded-full animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.8)]">
          {/* Custom Friendly Robo-Socrates Icon */}
          <svg width="32" height="32" viewBox="0 0 100 100" stroke="black" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              {/* Bouncy Antenna */}
              <path d="M50 10 Q55 20 50 28" />
              <circle cx="50" cy="10" r="6" fill="red" stroke="black" />
              
              {/* Head */}
              <rect x="15" y="28" width="70" height="60" rx="15" fill="white" />
              
              {/* Friendly Eyes */}
              <ellipse cx="35" cy="50" rx="8" ry="10" fill="black" />
              <circle cx="38" cy="48" r="3" fill="white" /> {/* Glint */}
              
              <ellipse cx="65" cy="50" rx="8" ry="10" fill="black" />
              <circle cx="68" cy="48" r="3" fill="white" /> {/* Glint */}

              {/* Cheeks */}
              <circle cx="25" cy="65" r="4" fill="#ff9999" stroke="none" opacity="0.6" />
              <circle cx="75" cy="65" r="4" fill="#ff9999" stroke="none" opacity="0.6" />

              {/* Smile */}
              <path d="M40 70 Q50 78 60 70" strokeWidth="3" />

              {/* Socrates Beard (Mechanical ZigZag) */}
              <path d="M30 88 L35 95 L40 88 L45 95 L50 88 L55 95 L60 88 L65 95 L70 88" stroke="gray" strokeWidth="2" />
          </svg>
        </div>
        <div>
           <h2 className="font-robot text-xl text-cyan-400 tracking-wider">SÓCRATES IA <span className="text-[10px] align-top bg-cyan-500 text-black px-1 rounded font-bold ml-1">PROFE</span></h2>
           <p className="text-xs text-cyan-600 font-mono">"Pensar duele, pero ignorar es peor."</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-xl border group relative ${
              msg.role === 'user' 
                ? 'bg-gray-800 border-gray-600 text-white rounded-br-none' 
                : 'bg-cyan-900/40 border-cyan-500/50 text-cyan-100 rounded-bl-none backdrop-blur-sm'
            }`}>
              <div className="flex items-center justify-between mb-1 opacity-60 text-xs font-mono uppercase">
                <div className="flex items-center gap-2">
                  {msg.role === 'user' ? <User size={10} /> : <Sparkles size={10} />}
                  {msg.role === 'user' ? 'TÚ' : 'EL PROFE'}
                </div>
              </div>
              <p className="leading-relaxed whitespace-pre-wrap text-sm md:text-base">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex justify-start">
             <div className="bg-cyan-900/20 border border-cyan-500/30 p-3 rounded-xl">
                <span className="flex gap-1">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-150"></span>
                </span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900 border-t border-cyan-500">
        <div className="flex gap-2 items-end">
          <div className="flex-grow flex flex-col gap-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribile algo al profe..."
              className="w-full bg-black border border-cyan-700 text-cyan-400 p-3 rounded-lg focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(6,182,212,0.5)] outline-none font-mono"
            />
          </div>
          
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 text-black p-3 rounded-lg transition-colors disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoboSocrates;
