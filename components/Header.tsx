
import React, { useState } from 'react';

const Header: React.FC = () => {
  const philosophersData = [
    { name: "PLATÓN", quote: "La ignorancia es la semilla de todo mal." },
    { name: "NIETZSCHE", quote: "Sin música, la vida sería un error." },
    { name: "KANT", quote: "¡Atrévete a pensar por ti mismo!" },
    { name: "SÓCRATES", quote: "Solo sé que no sé nada." },
    { name: "ARISTÓTELES", quote: "Somos lo que hacemos repetidamente." }
  ];

  const [activePhilosopher, setActivePhilosopher] = useState<string | null>(null);

  const renderAnimatedText = (text: string, colorClass: string, baseDelay: number) => {
    return text.split('').map((char, index) => (
      <span 
        key={`${text}-${index}`}
        className={`inline-block animate-explode-loop ${colorClass}`}
        style={{ animationDelay: `${(baseDelay + index) * 0.1}s` }}
      >
        {char}
      </span>
    ));
  };

  return (
    <header className="w-full bg-yellow-400 border-b-4 border-black p-4 relative overflow-visible shadow-[0_4px_0_0_rgba(0,0,0,1)] z-20">
      {/* Halftone pattern overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none halftone"></div>
      
      <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
        <h1 className="font-comic text-5xl md:text-6xl drop-shadow-[3px_3px_0_#000] mb-2 text-center leading-tight flex flex-wrap justify-center gap-x-4">
          <span className="whitespace-nowrap">
            {renderAnimatedText("CINEMA", "text-red-600", 0)}
          </span>
          <span className="whitespace-nowrap">
            {renderAnimatedText("SÓCRATES", "text-blue-600", 6)}
          </span>
        </h1>

        {/* Socrates Thought Bubble */}
        <div className="relative mb-6 mt-2 animate-bounce-slow">
           <div className="bg-white border-2 border-black px-4 py-2 rounded-[50%] relative shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]">
              <p className="font-punk text-lg md:text-xl text-black transform -rotate-1">
                ¡¡¡La filosofía no está muerta!!!
              </p>
              {/* Bubble tail circles */}
              <div className="absolute -bottom-2 left-1/2 w-3 h-3 bg-white border-2 border-black rounded-full transform -translate-x-1/2"></div>
              <div className="absolute -bottom-5 left-[48%] w-2 h-2 bg-white border-2 border-black rounded-full transform -translate-x-1/2"></div>
           </div>
        </div>
        
        {/* Comic Boxes for names */}
        <div className="flex flex-wrap justify-center gap-4 mt-2">
          {philosophersData.map((philosopher, index) => (
            <div 
              key={philosopher.name}
              className="relative group"
              onMouseEnter={() => setActivePhilosopher(philosopher.name)}
              onMouseLeave={() => setActivePhilosopher(null)}
              onTouchStart={() => setActivePhilosopher(philosopher.name)}
            >
              {/* The Name Box */}
              <div 
                className={`
                  bg-white border-2 border-black px-2 py-1 font-comic text-lg md:text-xl text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]
                  transform ${index % 2 === 0 ? 'rotate-2' : '-rotate-2'} 
                  hover:scale-110 hover:bg-pink-200 hover:rotate-0 hover:z-50
                  transition-all duration-200 cursor-help relative z-10
                `}
              >
                {philosopher.name}
              </div>

              {/* Interactive Quote Bubble */}
              {activePhilosopher === philosopher.name && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-48 z-50 animate-in zoom-in-50 duration-200">
                  <div className="bg-white border-2 border-black p-3 rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-center relative">
                    <p className="font-punk text-sm text-black leading-tight">
                      "{philosopher.quote}"
                    </p>
                    {/* Triangle Tail */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 
                      border-l-[8px] border-l-transparent
                      border-r-[8px] border-r-transparent
                      border-t-[8px] border-t-black">
                    </div>
                     <div className="absolute -bottom-[6px] left-1/2 transform -translate-x-1/2 w-0 h-0 
                      border-l-[6px] border-l-transparent
                      border-r-[6px] border-r-transparent
                      border-t-[6px] border-t-white">
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Comic decorations */}
      <div className="absolute top-2 right-4 w-12 h-12 bg-blue-400 rounded-full border-2 border-black flex items-center justify-center font-comic text-white hidden md:flex shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
        POW!
      </div>
      <div className="absolute bottom-2 left-4 w-16 h-10 bg-white border-2 border-black hidden md:flex items-center justify-center font-comic text-xs transform -skew-x-12 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
        V 2.0
      </div>
    </header>
  );
};

export default Header;
