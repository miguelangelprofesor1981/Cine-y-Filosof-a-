
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Sparkles, Mic, Volume2, Square } from 'lucide-react';
import { ChatMessage } from '../types';
import * as GeminiService from '../services/geminiService';
import { Chat } from '@google/genai';

const RoboSocrates: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'model', text: 'Saludos, humano. Soy Robo-Sócrates. ¿Qué inquietud filosófica perturba tus circuitos hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
      const responseText = result.text || "Mis sensores no detectan respuesta...";
      
      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Error de sistema. Reiniciando lógica..." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        stream.getTracks().forEach(track => track.stop());
        
        // Send to transcription
        setIsLoading(true);
        try {
          const text = await GeminiService.transcribeAudio(audioBlob);
          setInput(text);
        } catch (err) {
          console.error(err);
          alert("Error escuchando el audio.");
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("No se pudo acceder al micrófono.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel previous speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES'; // Spanish
      utterance.pitch = 0.8; // Lower pitch for "robot" feel
      utterance.rate = 1.0; 
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Tu navegador no soporta lectura de voz.");
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
           <h2 className="font-robot text-xl text-cyan-400 tracking-wider">ROBO-SÓCRATES <span className="text-[10px] align-top bg-cyan-500 text-black px-1 rounded font-bold ml-1">BETA</span></h2>
           <p className="text-xs text-cyan-600 font-mono">"Conócete a ti mismo... y a tu software"</p>
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
                  {msg.role === 'user' ? 'TÚ' : 'IA'}
                </div>
                {/* Speak Button for AI messages */}
                {msg.role === 'model' && (
                  <button 
                    onClick={() => speakText(msg.text)}
                    className="opacity-50 hover:opacity-100 transition-opacity text-cyan-300 p-1"
                    title="Leer respuesta"
                  >
                    <Volume2 size={14} />
                  </button>
                )}
              </div>
              <p className="leading-relaxed whitespace-pre-wrap text-sm md:text-base">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && !isRecording && (
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
           {/* Mic Button */}
           {isRecording ? (
             <button 
               onClick={stopRecording}
               className="bg-red-500 text-white p-3 rounded-lg animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"
               title="Detener grabación"
             >
               <Square size={20} fill="white" />
             </button>
           ) : (
             <button 
               onClick={startRecording}
               disabled={isLoading}
               className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-colors disabled:opacity-50"
               title="Hablar al robot"
             >
               <Mic size={20} />
             </button>
           )}

          <div className="flex-grow flex flex-col gap-1">
            {isRecording && <span className="text-xs text-red-400 animate-pulse font-mono ml-1">Escuchando...</span>}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isRecording ? "Escuchando..." : "Escribe o habla..."}
              disabled={isRecording}
              className="w-full bg-black border border-cyan-700 text-cyan-400 p-3 rounded-lg focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(6,182,212,0.5)] outline-none font-mono"
            />
          </div>
          
          <button 
            onClick={handleSend}
            disabled={isLoading || isRecording || !input.trim()}
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
