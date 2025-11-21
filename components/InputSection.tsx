
import React, { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { AppStatus } from '../types';
import { blobToBase64 } from '../services/geminiService';

interface InputSectionProps {
  inputText: string;
  setInputText: (text: string) => void;
  onMediaSelected?: (file: { data: string, mimeType: string, name: string } | null) => void;
  status: AppStatus;
}

const InputSection: React.FC<InputSectionProps> = ({ inputText, setInputText, onMediaSelected, status }) => {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isTextFile = file.type === 'text/plain' || file.name.endsWith('.txt');
    
    setSelectedFileName(file.name);

    if (isTextFile) {
        // Read text files directly into the textarea
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setInputText(text);
            // Clear media selection if it was purely text
            if (onMediaSelected) onMediaSelected(null);
        };
        reader.readAsText(file);
    } else {
        // Treat PDF/Word as media files for Gemini
        try {
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
            alert("Error leyendo el archivo.");
        }
    }
  };

  const clearFile = () => {
      setSelectedFileName(null);
      if (onMediaSelected) onMediaSelected(null);
      const fileInput = document.getElementById('document-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
  };

  const isBusy = status !== AppStatus.IDLE && status !== AppStatus.COMPLETED && status !== AppStatus.ERROR;

  return (
    <div className="bg-gray-800 rounded-xl p-1 border-2 border-gray-700 shadow-lg mb-6">
      {/* Header Label */}
      <div className="bg-gray-900 p-2 rounded-t-lg border-b border-gray-700 flex items-center gap-2">
         <FileText size={18} className="text-yellow-400" />
         <span className="font-bold text-gray-300 text-sm uppercase tracking-wider">
            Entrada de Texto / Documentos
         </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div className="relative">
            <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe aquí tu idea, frase filosófica o pega un fragmento de libro..."
            className="w-full h-40 bg-gray-900 text-white p-4 rounded-lg border border-gray-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none resize-none font-sans text-lg"
            disabled={isBusy}
            />
            
            {/* File Upload Overlay / Button */}
            <div className="absolute bottom-3 right-3">
                {selectedFileName ? (
                    <div className="flex items-center gap-2 bg-green-900/80 text-green-100 px-3 py-2 rounded-lg border border-green-500 shadow-lg animate-in fade-in slide-in-from-bottom-2">
                        <FileText size={16} />
                        <span className="text-xs font-bold max-w-[150px] truncate">{selectedFileName}</span>
                        <button onClick={clearFile} className="hover:text-white">
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center">
                        <input 
                            id="document-upload" 
                            type="file" 
                            accept=".txt,.pdf,.doc,.docx" 
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={isBusy}
                        />
                        <label 
                            htmlFor="document-upload" 
                            className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white p-2 px-4 rounded-full transition-colors flex items-center gap-2 text-xs font-bold shadow-md border border-gray-500"
                        >
                            <Upload size={16} /> 
                            Subir PDF / Word / Libro
                        </label>
                    </div>
                )}
            </div>
        </div>
        
        {!selectedFileName && (
            <p className="text-xs text-gray-500 text-center font-mono">
                Formatos aceptados: PDF, Word (.doc, .docx), Texto (.txt)
            </p>
        )}
      </div>
    </div>
  );
};

export default InputSection;
