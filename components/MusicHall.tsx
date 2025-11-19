import React, { useState, useRef, useEffect } from 'react';
import { Upload, Music, Link as LinkIcon, Loader2, Disc, Play, Pause, Volume2 } from 'lucide-react';
import { blobToBase64 } from '../services/geminiService';
import * as GeminiService from '../services/geminiService';

interface MusicHallProps {
  onError: (msg: string) => void;
}

const MusicHall: React.FC<MusicHallProps> = ({ onError }) => {
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; data: any; type: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEjected, setIsEjected] = useState(false); // Default closed
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Prepare base64 for AI
      const base64 = await blobToBase64(file);
      setSelectedFile({
        name: file.name,
        data: base64,
        type: file.type
      });

      // Prepare preview URL if audio
      if (file.type.startsWith('audio/')) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setIsPlaying(false);
      } else {
        setPreviewUrl(null);
      }

      // Auto-eject when file is loaded for effect
      setIsEjected(true);
    } catch (err) {
      onError("Error leyendo el archivo.");
    }
  };

  const handleAnalyze = async () => {
    if (!textInput && !selectedFile) {
      onError("Por favor ingresa un link o sube un archivo.");
      return;
    }

    setIsLoading(true);
    setAnalysis(null);
    setIsEjected(true); // Ensure it spins visible

    try {
      const filePayload = selectedFile ? { data: selectedFile.data, mimeType: selectedFile.type } : null;
      const result = await GeminiService.analyzeMusicContent(textInput, filePayload);
      setAnalysis(result);
    } catch (err) {
      onError("No se pudo analizar la obra musical.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEject = () => {
    setIsEjected(!isEjected);
  };

  const togglePlayPreview = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => onError("Error al reproducir audio"));
      setIsPlaying(true);
      setIsEjected(true); // Force eject to show spinning disc
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      // Limit to 15 seconds
      if (audioRef.current.currentTime >= 15) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Audio Element (Hidden) */}
      <audio 
        ref={audioRef} 
        src={previewUrl || ''} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
      />

      {/* Title with CD Animation */}
      <div className="flex flex-col items-center justify-center py-4">
        <div 
            className="relative w-72 h-72 perspective-1000 cursor-pointer"
            onClick={toggleEject}
        >
          
          {/* CD Disc (Light Color) - Z-Index 10 (Behind cover initially, but slides out) */}
          <div 
            className={`
                absolute top-2 bottom-2 left-2 w-68 h-68 z-10
                rounded-full border border-gray-300 shadow-xl
                flex items-center justify-center transition-all duration-700 ease-in-out
                bg-gradient-to-tr from-gray-100 via-white to-gray-200
            `}
            style={{
                transform: isEjected ? 'translateX(50%)' : 'translateX(0)'
            }}
          >
             {/* Spinning Container for content inside disc */}
             <div className="w-full h-full rounded-full relative animate-[spin_4s_linear_infinite]">
                {/* Iridescent reflection effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-white/60 to-transparent opacity-50"></div>
                
                {/* Inner rings */}
                <div className="absolute inset-8 rounded-full border border-gray-300/50"></div>
                <div className="absolute inset-12 rounded-full border border-gray-300/30"></div>

                {/* Center Hole */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white border-4 border-gray-200 rounded-full flex items-center justify-center shadow-inner">
                    <div className="w-6 h-6 bg-transparent border-2 border-gray-400 rounded-full"></div>
                </div>
             </div>
          </div>

          {/* CD Case (Newspaper Clippings) - Z-Index 20 (Top) */}
          <div className="absolute inset-0 z-20 bg-white border-4 border-black shadow-[10px_10px_0_0_rgba(0,0,0,0.8)] overflow-hidden group transition-transform active:scale-95">
             {/* Newspaper Texture Image */}
             <img 
                src="https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=800&auto=format&fit=crop" 
                alt="Newspaper Clippings" 
                className="w-full h-full object-cover sepia contrast-125 brightness-110 group-hover:scale-105 transition-transform duration-700"
             />
             
             {/* Overlay to blend texts */}
             <div className="absolute inset-0 bg-yellow-900/10 mix-blend-multiply pointer-events-none"></div>
             
             {/* Grunge Texture Overlay */}
             <div className="absolute inset-0 opacity-40 halftone pointer-events-none"></div>

             {/* Title - Sticker Style */}
             <div className="absolute top-6 left-0 bg-white text-black font-punk text-2xl px-4 py-2 transform -rotate-6 shadow-md border-2 border-black">
                MUSIC HALL
             </div>
             
             {/* Ransom note decoration */}
             <div className="absolute bottom-12 left-4 flex gap-1 transform rotate-2">
                 <span className="bg-black text-white p-1 font-comic text-sm">PUNK</span>
                 <span className="bg-white text-black p-1 font-comic text-sm border border-black">NOT</span>
                 <span className="bg-red-600 text-white p-1 font-comic text-sm">DEAD</span>
             </div>

             <div className="absolute bottom-4 right-4 border-2 border-black p-1 transform rotate-1 bg-white">
                <div className="bg-black text-white text-[10px] font-bold px-2 py-1 leading-tight text-center font-sans tracking-tighter">
                  PARENTAL ADVISORY<br/><span className="text-xs">EXPLICIT CONTENT</span>
                </div>
             </div>
          </div>
          
        </div>
      </div>

      {/* Inputs */}
      <div className="bg-yellow-50 p-6 border-4 border-black shadow-[8px_8px_0_0_#000] transform -rotate-1 relative z-30">
        <h3 className="font-punk text-2xl text-black mb-4 transform skew-x-6 border-b-4 border-black inline-block">CARGAR DATA</h3>
        
        <div className="mb-4">
          <label className="block text-black font-bold mb-2 flex items-center gap-2 font-comic uppercase tracking-wider">
            <LinkIcon size={20} className="text-pink-600" /> Link / Contexto
          </label>
          <input 
            type="text" 
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Pegar link de YouTube, Spotify o nombre del álbum..."
            className="w-full bg-white border-2 border-black rounded-none p-3 text-black focus:bg-pink-100 focus:border-pink-600 outline-none font-mono shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]"
          />
        </div>

        <div className="mb-6">
          <label className="block text-black font-bold mb-2 flex items-center gap-2 font-comic uppercase tracking-wider">
            <Upload size={20} className="text-blue-600" /> Archivo de Audio
          </label>
          <div className="relative group">
             <input 
                type="file" 
                accept=".mp3,.wav,.pdf,.txt"
                onChange={handleFileChange}
                className="hidden" 
                id="music-file"
             />
             <div className="flex gap-2">
                <label htmlFor="music-file" className="cursor-pointer flex-grow bg-black text-white border-2 border-transparent group-hover:border-yellow-400 group-hover:text-yellow-400 p-4 text-center transition-all font-bold uppercase tracking-widest">
                    {selectedFile ? (
                    <span className="text-green-400 font-mono flex items-center justify-center gap-2 animate-pulse">
                        <Disc size={16} /> {selectedFile.name}
                    </span>
                    ) : (
                    <span className="flex items-center justify-center gap-2">
                        CLICK PARA SUBIR MP3 / WAV
                    </span>
                    )}
                </label>
                
                {/* Play Preview Button - Only if audio is loaded */}
                {previewUrl && (
                  <button 
                    onClick={togglePlayPreview}
                    className={`
                      w-16 flex items-center justify-center border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] transition-all
                      ${isPlaying ? 'bg-green-500 hover:bg-green-400' : 'bg-pink-500 hover:bg-pink-400'}
                    `}
                    title={isPlaying ? "Pausar Preview" : "Escuchar 15s"}
                  >
                    {isPlaying ? <Pause className="text-white" size={24} /> : <Play className="text-white" size={24} />}
                  </button>
                )}
             </div>
             {previewUrl && (
               <p className="text-xs font-mono text-gray-500 mt-1 flex items-center gap-1">
                 <Volume2 size={12} /> Preview disponible: 15 segundos
               </p>
             )}
          </div>
        </div>

        <button 
          onClick={handleAnalyze}
          disabled={isLoading}
          className="w-full bg-pink-600 hover:bg-pink-500 text-white font-punk text-3xl py-4 border-4 border-black shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> DECONSTRUYENDO...</span>
          ) : "ANALIZAR AHORA"}
        </button>
      </div>

      {/* Output */}
      {analysis && (
        <div className="bg-white text-black p-6 border-4 border-black shadow-[8px_8px_0_0_#ef4444] relative mt-8">
           {/* Tape effect */}
           <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-yellow-200/80 border-l border-r border-white/50 rotate-1 shadow-sm"></div>
           
           <h3 className="font-punk text-3xl mb-6 text-red-600 uppercase tracking-widest text-center">CRÍTICA FILOSÓFICA</h3>
           <div className="prose max-w-none font-serif text-lg leading-relaxed whitespace-pre-line border-l-4 border-neutral-300 pl-4">
             {analysis}
           </div>
        </div>
      )}
    </div>
  );
};

export default MusicHall;