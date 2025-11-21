
import React, { useState } from 'react';
import { ImageStyle, AppStatus, GenerationResult, AppSection, CinemaGenre } from './types';
import * as GeminiService from './services/geminiService';
import Header from './components/Header';
import Footer from './components/Footer';
import InputSection from './components/InputSection';
import MusicHall from './components/MusicHall';
import RoboSocrates from './components/RoboSocrates';
import { Clapperboard, Smile, Share2, Download, Loader2, Film, Music, Sparkles, Palette } from 'lucide-react';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.CINEMA);
  
  // Cinema State
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>(ImageStyle.HOLLYWOOD);
  const [cinemaGenre, setCinemaGenre] = useState<CinemaGenre>(CinemaGenre.EPIC);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [mediaFile, setMediaFile] = useState<{ data: string, mimeType: string, name: string } | null>(null);
  
  // Global Error
  const [error, setError] = useState<string | null>(null);

  const handleMediaSelected = (file: { data: string, mimeType: string, name: string } | null) => {
    setMediaFile(file);
  };

  const handleGenerate = async () => {
    if (!inputText.trim() && !mediaFile) return;

    setStatus(AppStatus.ENHANCING_PROMPT);
    setError(null);
    setResult(null);

    try {
      // 1. Analyze and Generate Concept (Title, Actors, Visual Prompt)
      const concept = await GeminiService.generateMovieConcept(inputText, selectedStyle, cinemaGenre, mediaFile);
      
      let visualPrompt = "";
      let movieMetadata = undefined;

      if (typeof concept === 'string') {
        // Meme or fallback
        visualPrompt = concept;
      } else {
        // Movie JSON
        visualPrompt = concept.visualPrompt;
        movieMetadata = {
            title: concept.title,
            actors: concept.actors
        };
      }
      
      // 2. Generate Image
      setStatus(AppStatus.GENERATING_IMAGE);
      const imageUrl = await GeminiService.generateImage(visualPrompt, selectedStyle, cinemaGenre);

      setResult({
        imageUrl,
        originalPrompt: inputText || mediaFile?.name || "Media Content",
        enhancedPrompt: visualPrompt,
        movieMetadata
      });
      setStatus(AppStatus.COMPLETED);
    } catch (err) {
      console.error(err);
      setError("Hubo un error generando la imagen. Por favor intenta otra vez.");
      setStatus(AppStatus.ERROR);
    }
  };

  const downloadImage = () => {
    if (result?.imageUrl) {
      const link = document.createElement('a');
      link.href = result.imageUrl;
      link.download = `cinema-socrates-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 text-white">
      <Header />

      {/* Navigation */}
      <div className="bg-black border-b border-gray-700 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto flex">
          <button
            onClick={() => setActiveSection(AppSection.CINEMA)}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-bold transition-colors ${
              activeSection === AppSection.CINEMA ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Film size={18} /> CINE
          </button>
          <button
            onClick={() => setActiveSection(AppSection.MUSIC_HALL)}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-bold transition-colors ${
              activeSection === AppSection.MUSIC_HALL ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Music size={18} /> MUSIC HALL
          </button>
          <button
            onClick={() => setActiveSection(AppSection.ROBO_SOCRATES)}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-bold transition-colors ${
              activeSection === AppSection.ROBO_SOCRATES ? 'bg-cyan-600 text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            {/* Custom Friendly Robot Icon */}
            <svg viewBox="0 0 100 100" className="w-6 h-6" stroke="currentColor" fill="none" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
               <path d="M50 15 V 30" />
               <rect x="20" y="30" width="60" height="50" rx="10" />
               <circle cx="35" cy="50" r="2" fill="currentColor" stroke="none" />
               <circle cx="65" cy="50" r="2" fill="currentColor" stroke="none" />
               <path d="M35 65 Q50 75 65 65" strokeWidth="6" />
            </svg>
            ROBOT
          </button>
        </div>
      </div>

      <main className="flex-grow p-4 md:p-6 max-w-3xl mx-auto w-full">
        
        {/* Error Message Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg text-center font-mono text-sm animate-pulse">
            {error}
          </div>
        )}

        {/* CINEMA SECTION */}
        {activeSection === AppSection.CINEMA && (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* Clapperboard Legend */}
            <div className="relative mx-auto max-w-lg mb-6 group">
              {/* The Clapperboard Top (Animated on hover/loading) */}
              <div className={`
                 h-8 bg-neutral-800 border-b-2 border-black rounded-t-lg relative overflow-hidden origin-bottom-left transition-transform duration-300 z-10
                 ${status !== AppStatus.IDLE && status !== AppStatus.COMPLETED && status !== AppStatus.ERROR ? 'animate-[pulse_1s_ease-in-out_infinite]' : 'group-hover:-rotate-6'}
              `}>
                 <div className="absolute inset-0 flex">
                    <div className="w-10 h-full bg-white -skew-x-12 border-r-2 border-black"></div>
                    <div className="w-10 h-full bg-neutral-800 -skew-x-12 border-r-2 border-black ml-4"></div>
                    <div className="w-10 h-full bg-white -skew-x-12 border-r-2 border-black ml-4"></div>
                    <div className="w-10 h-full bg-neutral-800 -skew-x-12 border-r-2 border-black ml-4"></div>
                    <div className="w-10 h-full bg-white -skew-x-12 border-r-2 border-black ml-4"></div>
                    <div className="w-10 h-full bg-neutral-800 -skew-x-12 border-r-2 border-black ml-4"></div>
                    <div className="w-10 h-full bg-white -skew-x-12 border-r-2 border-black ml-4"></div>
                 </div>
              </div>
              
              {/* The Board Body */}
              <div className="bg-neutral-800 p-6 rounded-b-lg border-4 border-neutral-700 shadow-2xl relative">
                 <div className="absolute top-2 left-2 w-2 h-2 bg-gray-400 rounded-full"></div>
                 <div className="absolute top-2 right-2 w-2 h-2 bg-gray-400 rounded-full"></div>
                 <div className="absolute bottom-2 left-2 w-2 h-2 bg-gray-400 rounded-full"></div>
                 <div className="absolute bottom-2 right-2 w-2 h-2 bg-gray-400 rounded-full"></div>

                 <p className="font-punk text-xl md:text-2xl text-white/90 text-center tracking-wider leading-relaxed" style={{ fontFamily: "'Permanent Marker', cursive" }}>
                  "TODO LO QUE SE ESCRIBE Y SE PIENSA, TAMBIÉN SE OBSERVA"
                 </p>
                 
                 <div className="mt-2 flex justify-center gap-8 text-xs font-mono text-gray-400 uppercase tracking-widest">
                    <span>Scene: 1</span>
                    <span>Take: {Math.floor(Math.random() * 99) + 1}</span>
                 </div>
              </div>
            </div>

            <InputSection 
              inputText={inputText} 
              setInputText={setInputText} 
              onMediaSelected={handleMediaSelected}
              status={status}
            />

            {/* MAIN STYLE SELECTOR */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedStyle(ImageStyle.HOLLYWOOD)}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  selectedStyle === ImageStyle.HOLLYWOOD 
                    ? 'bg-blue-900 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                    : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                }`}
              >
                <Clapperboard size={32} className="text-blue-400" />
                <span className="font-comic text-xl tracking-wide">PÓSTER CINE</span>
              </button>

              <button
                onClick={() => setSelectedStyle(ImageStyle.MEME)}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  selectedStyle === ImageStyle.MEME 
                    ? 'bg-purple-900 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]' 
                    : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                }`}
              >
                <Smile size={32} className="text-purple-400" />
                <span className="font-comic text-xl tracking-wide">MEME</span>
              </button>
            </div>

            {/* SUB-STYLE SELECTOR (GENRE) - Only for CINEMA */}
            {selectedStyle === ImageStyle.HOLLYWOOD && (
               <div className="animate-in slide-in-from-top-2 duration-300">
                 <h3 className="text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider ml-1 flex items-center gap-2">
                   <Palette size={12} /> Selecciona el Estilo Visual:
                 </h3>
                 <div className="flex flex-wrap gap-2">
                    {[
                      { id: CinemaGenre.EPIC, label: 'ÉPICO', color: 'bg-yellow-500 text-black' },
                      { id: CinemaGenre.INDIE, label: 'CINE ARTE', color: 'bg-emerald-500 text-white' },
                      { id: CinemaGenre.RETRO, label: 'RETRO 80s', color: 'bg-orange-500 text-black' },
                      { id: CinemaGenre.NOIR, label: 'NOIR / B&W', color: 'bg-gray-200 text-black' },
                      { id: CinemaGenre.SCIFI, label: 'FUTURISTA', color: 'bg-cyan-500 text-black' }
                    ].map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setCinemaGenre(style.id)}
                        className={`
                          flex-1 min-w-[100px] py-2 px-3 rounded-lg font-bold text-sm md:text-base border-2 transition-all transform
                          ${cinemaGenre === style.id 
                            ? `${style.color} border-white shadow-[2px_2px_0_0_#fff] scale-105` 
                            : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                          }
                        `}
                      >
                        {style.label}
                      </button>
                    ))}
                 </div>
               </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={(!inputText.trim() && !mediaFile) || (status !== AppStatus.IDLE && status !== AppStatus.COMPLETED && status !== AppStatus.ERROR)}
              className={`w-full py-4 rounded-xl font-punk text-2xl md:text-3xl transition-all transform hover:-translate-y-1 ${
                (!inputText.trim() && !mediaFile)
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-yellow-400 text-black hover:bg-yellow-300 shadow-[4px_4px_0_0_#000] border-2 border-black'
              }`}
            >
              {status === AppStatus.IDLE || status === AppStatus.COMPLETED || status === AppStatus.ERROR ? (
                "¡ACCIÓN!"
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="animate-spin" />
                  {status === AppStatus.TRANSCRIBING && "ESCUCHANDO..."}
                  {status === AppStatus.ENHANCING_PROMPT && "ESCRIBIENDO GUION..."}
                  {status === AppStatus.GENERATING_IMAGE && "RODANDO..."}
                </span>
              )}
            </button>

            {result && status === AppStatus.COMPLETED && (
              <div className="mt-8 animate-in slide-in-from-bottom-10 duration-700">
                {/* Movie Poster Container */}
                <div className="bg-black p-3 rounded-xl border-4 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)] max-w-md mx-auto">
                  <img 
                    src={result.imageUrl} 
                    alt="Generated" 
                    className="w-full h-auto rounded-lg border border-gray-800"
                  />
                  
                  {/* Movie Metadata Display (Credits) */}
                  {result.movieMetadata && (
                     <div className="mt-4 text-center text-yellow-500 font-serif tracking-widest">
                        <h2 className="text-2xl md:text-3xl font-bold uppercase mb-2 leading-tight" style={{ textShadow: '2px 2px 0 #000' }}>
                            {result.movieMetadata.title}
                        </h2>
                        <div className="flex justify-center items-center gap-2 text-xs text-gray-400 mb-1 uppercase border-b border-gray-800 pb-2">
                           <span>Una producción de Cinema Sócrates</span>
                           <span>•</span>
                           <span>Dirigida por IA</span>
                        </div>
                        <div className="text-sm md:text-lg text-white mt-2 uppercase">
                           <span className="text-gray-500 text-xs block mb-1">Protagonizada por</span>
                           {result.movieMetadata.actors}
                        </div>
                     </div>
                  )}
                </div>
                
                <div className="flex justify-between mt-6 gap-2 max-w-md mx-auto">
                  <button 
                    onClick={downloadImage}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg font-comic tracking-wide flex items-center justify-center gap-2 transition-colors border border-gray-600"
                  >
                    <Download size={20} /> PÓSTER
                  </button>
                  <button 
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg font-comic tracking-wide flex items-center justify-center gap-2 transition-colors border border-gray-600"
                    onClick={() => {
                        // FIX: Validate URL for navigator.share to prevent "Invalid URL" error
                        if (navigator.share) {
                            let urlToShare = window.location.href;
                            // Ensure URL is valid (has protocol)
                            if (!urlToShare.startsWith('http')) {
                                urlToShare = 'https://www.instagram.com/elprofedefilosofia'; // Safe fallback
                            }
                            
                            navigator.share({
                                title: result.movieMetadata?.title || 'Cinema Sócrates',
                                text: `Mira esta película filosófica generada por IA: ${result.movieMetadata?.title}`,
                                url: urlToShare
                            }).catch((error) => {
                                console.error('Share failed:', error);
                                // Don't alert error if user just cancelled, but if it's system error fallback:
                                if (error.name !== 'AbortError') {
                                   alert("No se pudo compartir. Puedes descargar la imagen.");
                                }
                            });
                        } else {
                            alert("Función compartir no disponible.");
                        }
                    }}
                  >
                    <Share2 size={20} /> ESTRENO
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MUSIC HALL SECTION */}
        {activeSection === AppSection.MUSIC_HALL && (
          <MusicHall onError={(msg) => setError(msg)} />
        )}

        {/* ROBOT SECTION */}
        {activeSection === AppSection.ROBO_SOCRATES && (
          <RoboSocrates />
        )}

      </main>

      <Footer />
    </div>
  );
};

export default App;
