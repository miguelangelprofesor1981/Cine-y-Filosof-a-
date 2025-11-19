
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-neutral-900 border-t-4 border-pink-600 relative pt-8 pb-4 mt-auto overflow-hidden">
      {/* Graffiti / Grunge background elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-600 via-purple-600 to-green-400"></div>
      
      <div className="max-w-6xl mx-auto relative z-10 flex flex-col w-full">
        
        {/* Center: Quote - Clickable Link */}
        <div className="text-center mb-6 px-4">
          <a 
            href="https://www.wattpad.com/1577907849-pensamientos-bajo-el-puente-primera-parte" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block transform -rotate-1 bg-black border-2 border-white p-4 shadow-[4px_4px_0_0_#ff00de] hover:scale-105 transition-transform cursor-pointer hover:shadow-[6px_6px_0_0_#ff00de]"
          >
            <p className="font-punk text-2xl md:text-3xl text-green-400 tracking-widest leading-tight">
              NO SE OLVIDEN DE <span className="text-pink-500 underline decoration-wavy decoration-2">AMAR</span>,
              <br />
              <span className="text-white text-xl md:text-2xl block mt-2 bg-pink-600 px-2 transform skew-x-12">
                SOLO DE ESO SE TRATA
              </span>
            </p>
          </a>
        </div>
        
        {/* Moving Banner */}
        <div className="w-full bg-yellow-400 border-y-2 border-black py-1 mb-8 overflow-hidden shadow-lg transform -rotate-1">
           <div className="animate-marquee-right font-comic text-xl text-black font-bold tracking-wider">
              PRÓXIMO ESTRENO... MUY PRONTO &nbsp;&nbsp; • &nbsp;&nbsp; PRÓXIMO ESTRENO... MUY PRONTO &nbsp;&nbsp; • &nbsp;&nbsp; PRÓXIMO ESTRENO... MUY PRONTO
           </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end px-6 gap-6">
             
             {/* LEFT: Copyright */}
             <div className="text-center md:text-left order-2 md:order-1">
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                  Copyright La Argentina - 2025
                </p>
                <p className="text-[10px] text-gray-500 font-mono">
                  Todos los derechos reservados
                </p>
             </div>

             {/* CENTER: Platform pills (Optional, kept for aesthetic balance) */}
             <div className="order-3 md:order-2 opacity-30 hidden md:block">
                 <span className="text-[10px] font-mono text-gray-500 mx-1">ANDROID</span>
                 <span className="text-[10px] font-mono text-gray-500 mx-1">IPHONE</span>
                 <span className="text-[10px] font-mono text-gray-500 mx-1">WINDOWS</span>
             </div>

             {/* RIGHT: Instagram */}
             <div className="order-1 md:order-3 flex items-center gap-4">
                 {/* Pointing Hand Animation (Refined Cartoon Style) */}
                 <div className="hidden md:block animate-point-horizontal">
                    <svg width="50" height="50" viewBox="0 0 100 100" fill="white" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                       {/* Cuff */}
                       <path d="M10,40 Q15,40 20,35 L20,65 Q15,60 10,60 Z" />
                       
                       {/* Hand Body */}
                       <path d="M20,30 Q45,15 55,40 L55,60 Q45,85 20,70 Z" />
                       
                       {/* Index Finger Pointing Right */}
                       <path d="M50,40 L90,40 Q95,45 90,50 L50,50" />
                       
                       {/* Thumb */}
                       <path d="M30,30 Q35,10 45,30" fill="white" />
                       
                       {/* Glove Detail Lines (Back of hand) */}
                       <line x1="28" y1="40" x2="40" y2="40" strokeWidth="2" />
                       <line x1="28" y1="48" x2="40" y2="48" strokeWidth="2" />
                       <line x1="28" y1="56" x2="40" y2="56" strokeWidth="2" />
                       
                       {/* Motion Lines (Speed) */}
                       <line x1="5" y1="45" x2="-5" y2="45" strokeWidth="2" />
                       <line x1="5" y1="55" x2="-5" y2="55" strokeWidth="2" />
                    </svg>
                 </div>
                 <div className="md:hidden text-3xl animate-bounce">
                    👉
                 </div>

                 <a 
                    href="https://www.instagram.com/elprofedefilosofia" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 px-4 rounded-full hover:scale-105 transition-transform shadow-[0_0_15px_rgba(236,72,153,0.5)] text-sm"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    @elprofedefilosofia
                 </a>
             </div>
        </div>
      </div>

      {/* Ripped paper effect simulation at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800"></div>
    </footer>
  );
};

export default Footer;
