
import React, { useState, useRef } from 'react';
import { Mic, Square, Type, Upload, Video, Link as LinkIcon } from 'lucide-react';
import { AppStatus } from '../types';
import { blobToBase64 } from '../services/geminiService';

interface InputSectionProps {
  inputText: string;
  setInputText: (text: string) => void;
  onAudioCaptured: (blob: Blob) => void;
  onMediaSelected?: (file: { data: string, mimeType: string, name: string } | null) => void;
  status: AppStatus;
}

const InputSection: React.FC<InputSectionProps> = ({ inputText, setInputText, onAudioCaptured, onMediaSelected, status }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'audio' | 'video'>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        onAudioCaptured(audioBlob);
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
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

  const handleTextFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
    };
    reader.readAsText(file);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 20 * 1024 * 1024) {
      alert("El video es muy grande. Por favor usa videos menores a 20MB o un link de YouTube.");
      return;
    }

    try {
      setSelectedFileName(file.name);
      const base64 = await blobToBase64(file);
      if (onMediaSelected) {
        onMediaSelected({
          data: base64,
          mimeType: file.type,
          name: file.name
        });
      }
    } catch (err) {
      console.error(err);
      alert("Error procesando el video.");
    }
  };

  const isBusy = status !== AppStatus.IDLE && status !== AppStatus.COMPLETED && status !== AppStatus.ERROR;

  return (
    <div className="bg-gray-800 rounded-xl p-1 border-2 border-gray-700 shadow-lg mb-6">
      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-900 p-1 rounded-lg overflow-x-auto">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-md font-bold transition-all whitespace-nowrap text-sm md:text-base ${
            activeTab === 'text' ? 'bg-yellow-400 text-black shadow-[0_2px_0_0_rgba(0,0,0,1)]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Type size={16} />
          PDF / Word / Libros
        </button>
        <button
          onClick={() => setActiveTab('audio')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-md font-bold transition-all whitespace-nowrap text-sm md:text-base ${
            activeTab === 'audio' ? 'bg-pink-500 text-white shadow-[0_2px_0_0_rgba(0,0,0,1)]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Mic size={16} />
          Voz
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-md font-bold transition-all whitespace-nowrap text-sm md:text-base ${
            activeTab === 'video' ? 'bg-blue-600 text-white shadow-[0_2px_0_0_rgba(0,0,0,1)]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Video size={16} />
          Video / Link
        </button>
      </div>

      {/* Content */}
      <div className="p-2">
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Pega aquí el texto de tu PDF, Word o libro para analizar..."
                className="w-full h-32 bg-gray-900 text-white p-4 rounded-lg border border-gray-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none resize-none font-sans"
                disabled={isBusy}
              />
              <div className="absolute bottom-2 right-2">
                <label htmlFor="file-upload" className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full transition-colors flex items-center gap-2 text-xs px-3">
                   <Upload size={14} /> Subir .txt
                </label>
                <input 
                    id="file-upload" 
                    type="file" 
                    accept=".txt" 
                    className="hidden"
                    onChange={handleTextFileUpload}
                    disabled={isBusy}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="flex flex-col items-center justify-center h-32 space-y-4">
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)] hover:scale-105 transition-transform"
              >
                <Square fill="white" className="text-white" size={24} />
              </button>
            ) : (
              <button
                onClick={startRecording}
                disabled={isBusy}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isBusy ? 'bg-gray-600 opacity-50' : 'bg-pink-500 hover:bg-pink-400 shadow-[0_4px_0_0_rgba(0,0,0,0.5)] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.5)]'}`}
              >
                <Mic className="text-white" size={32} />
              </button>
            )}
            <p className="text-sm font-mono text-gray-300">
              {isRecording ? "Grabando... (Habla sobre filosofía)" : "Toca para grabar tu idea"}
            </p>
          </div>
        )}

        {activeTab === 'video' && (
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Pega un Link de YouTube o describe tu video..."
                className="w-full bg-gray-900 text-white p-4 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-sans"
                disabled={isBusy}
              />
              <div className="absolute right-2 top-2 bottom-2 flex items-center">
                  <LinkIcon size={20} className="text-gray-500" />
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-900/50 hover:bg-gray-900 transition-colors">
               <input 
                  id="video-upload" 
                  type="file" 
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoUpload}
                  disabled={isBusy}
               />
               <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-2 text-gray-400 hover:text-blue-400">
                  {selectedFileName ? (
                     <>
                       <Video size={32} className="text-green-400" />
                       <span className="text-white font-bold">{selectedFileName}</span>
                       <span className="text-xs text-green-500">Video cargado listo para analizar</span>
                     </>
                  ) : (
                     <>
                       <Upload size={32} />
                       <span className="font-bold">Subir archivo de Video</span>
                       <span className="text-xs text-gray-500">(Max 20MB para optimizar rendimiento)</span>
                     </>
                  )}
               </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputSection;
