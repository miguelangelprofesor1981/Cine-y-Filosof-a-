
import { GoogleGenAI, Chat, Modality } from "@google/genai";
import { ImageStyle, ChatMessage, CinemaGenre } from "../types";

// Initialize the client
// Note: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a Blob to a Base64 string.
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove the data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Transcribes audio to text using Gemini Flash.
 */
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    const base64Audio = await blobToBase64(audioBlob);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: audioBlob.type || 'audio/wav',
              data: base64Audio
            }
          },
          {
            text: "Transcribe this audio exactly as spoken. Do not add any commentary."
          }
        ]
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe audio.");
  }
};

interface MovieConcept {
  title: string;
  actors: string;
  visualPrompt: string;
}

/**
 * Generates a Movie Concept (Title, Actors, Prompt) or Meme Prompt based on input.
 * Handles Text, Images, and Video frames (via base64).
 */
export const generateMovieConcept = async (
  textInput: string, 
  style: ImageStyle,
  genre: CinemaGenre = CinemaGenre.EPIC,
  mediaFile?: { data: string; mimeType: string } | null
): Promise<MovieConcept | string> => {
  
  // If Meme, keep it simple and return string
  if (style === ImageStyle.MEME) {
     const parts: any[] = [];
     if (mediaFile) {
       parts.push({ inlineData: { data: mediaFile.data, mimeType: mediaFile.mimeType } });
     }
     parts.push({
       text: `You are a meme creator. Convert this input into a funny visual description for a meme. Input: "${textInput}". Keep it simple.`
     });
     
     const response = await ai.models.generateContent({
       model: 'gemini-2.5-flash',
       contents: { parts },
     });
     return response.text || textInput;
  }

  // Define Genre-Specific Instructions
  let artDirection = "";
  switch (genre) {
    case CinemaGenre.EPIC:
      artDirection = "Estilo Hollywood Blockbuster Fotorrealista (Live Action). Fotografía cinematográfica de alta gama. Actores humanos reales con texturas de piel detalladas y realistas. Iluminación dramática de estudio. Estilo de superproducción de cine (IMAX quality).";
      break;
    case CinemaGenre.INDIE:
      artDirection = "Estilo A24 / Cine Arte / Indie. Usa simbolismo, surrealismo, minimalismo, y composiciones artísticas no convencionales. Puede ser abstracto o psicológico. Espacio negativo. Colores apagados o saturación selectiva. Estilo 'The Lobster', 'Midsommar', 'Everything Everywhere All At Once'.";
      break;
    case CinemaGenre.RETRO:
      artDirection = "Estilo Vintage Retro (70s/80s). Aspecto de póster ilustrado a mano (estilo Drew Struzan) o aerógrafo. Textura de papel doblado. Tipografía clásica. Estilo Star Wars original, Indiana Jones, Back to the Future. Colores cálidos y grano de película.";
      break;
    case CinemaGenre.NOIR:
      artDirection = "Estilo Film Noir / Cine Negro Clásico. Blanco y Negro de alto contraste (Chiaroscuro). Sombras largas, siluetas, lluvia, humo, detectives, misterio. Estilo Sin City o Double Indemnity. Dramático y oscuro.";
      break;
    case CinemaGenre.SCIFI:
      artDirection = "Estilo Futurista Cyberpunk / Sci-Fi. Luces de neón, tecnología avanzada, ciudades distópicas, cian y magenta. Geometría brillante, androides, cromo. Estilo Blade Runner, Tron, Matrix.";
      break;
    default:
      artDirection = "Estilo Cinematográfico General.";
  }

  // If Hollywood/Cinema, return JSON structure
  const parts: any[] = [];
  if (mediaFile) {
    parts.push({ inlineData: { data: mediaFile.data, mimeType: mediaFile.mimeType } });
  }

  const systemPrompt = `
    Actúa como un Director de Arte de Cine y Filósofo.
    Analiza el contenido (texto, video o audio) y genera un concepto para un PÓSTER DE CINE basado en el género: ${genre}.
    
    Instrucciones de Dirección de Arte (${genre}):
    ${artDirection}
    
    Debes inventar:
    1. Un Título de Película (Movie Title) creativo y filosófico.
    2. Nombres de Actores ficticios (juegos de palabras entre filósofos y actores).
    3. Un "visualPrompt" (en inglés) para generar la imagen del póster.
       - El prompt DEBE describir la COMPOSICIÓN del póster.
       - NO te limites a describir una escena. Describe un AFICHE IMPRESO con diseño gráfico.
       - Usa términos técnicos de ese género (ej: "double exposure" para Indie, "airbrush" para Retro).
       - Adáptate estrictamente al estilo visual solicitado (${genre}).

    Responde SOLAMENTE con este formato JSON:
    {
      "title": "Título",
      "actors": "Actor 1, Actor 2",
      "visualPrompt": "Movie poster for [Title]. [Art Style Description]. Central visual: [Details]. Typography details..."
    }
    
    Input del usuario: "${textInput}"
  `;
  
  parts.push({ text: systemPrompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: { responseMimeType: "application/json" }
    });
    
    let text = response.text || "{}";
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    
    return JSON.parse(text) as MovieConcept;
  } catch (error) {
    console.error("Concept generation error:", error);
    return {
      title: "Cinema Sócrates",
      actors: "IA Desconocida",
      visualPrompt: textInput + ", movie poster style"
    };
  }
};

/**
 * Generates an image using Imagen 3/4 or fallback to Flash Image.
 */
export const generateImage = async (prompt: string, style: ImageStyle, genre?: CinemaGenre): Promise<string> => {
  // Cinema posters are usually portrait (9:16) or landscape (16:9). 
  const aspectRatio = style === ImageStyle.HOLLYWOOD ? '3:4' : '1:1';
  
  // The prompt coming from generateMovieConcept already contains specific style keywords.
  // We add structural keywords to ensure it looks like a poster/meme and strictly enforces the genre aesthetic.
  let structuralKeywords = style === ImageStyle.HOLLYWOOD 
    ? "high quality movie poster, cinematic composition, professional graphic design, 8k resolution, text title overlay, credits block at bottom" 
    : "meme style, funny, internet humor";

  // Enforce specific visual style based on Genre
  if (style === ImageStyle.HOLLYWOOD && genre) {
    switch (genre) {
      case CinemaGenre.EPIC:
        structuralKeywords += ", photorealistic, live action, detailed skin texture, hyperrealistic photography, blockbuster aesthetics, IMAX quality, dramatic studio lighting";
        break;
      case CinemaGenre.INDIE:
        structuralKeywords += ", A24 style, surreal, abstract art, artistic composition, negative space, psychological horror, soft lighting, film grain, muted colors, double exposure, minimal";
        break;
      case CinemaGenre.RETRO:
        structuralKeywords += ", 80s vintage movie poster, hand painted style, airbrush, Drew Struzan style, worn paper texture, retro typography, synthwave colors, distressed edges";
        break;
      case CinemaGenre.NOIR:
        structuralKeywords += ", film noir, black and white photography, high contrast, chiaroscuro, dramatic shadows, silhouette, crime thriller, mysterious atmosphere, smoke and fog";
        break;
      case CinemaGenre.SCIFI:
        structuralKeywords += ", futuristic, cyberpunk, neon lights, high tech, glowing geometry, sci-fi concept art, chrome metal, blade runner aesthetic, digital art";
        break;
    }
  }

  const finalPrompt = `${prompt}. ${structuralKeywords}`;

  // Strategy 1: Try Imagen 4 (High Quality)
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: finalPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
  } catch (error) {
    console.warn("Imagen 4 model failed, attempting fallback to Flash Image...", error);
  }

  // Strategy 2: Fallback to Gemini 2.5 Flash Image (General Purpose)
  try {
     const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: finalPrompt }],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
       for (const part of response.candidates[0].content.parts) {
         if (part.inlineData) {
           return `data:image/png;base64,${part.inlineData.data}`;
         }
       }
    }
  } catch (error) {
    console.error("Fallback image generation failed:", error);
  }

  throw new Error("Failed to generate image with all available models.");
};

/**
 * Analyzes music or text for philosophical meaning.
 */
export const analyzeMusicContent = async (
  textInput: string, 
  file: { data: string; mimeType: string } | null
): Promise<string> => {
  try {
    const parts: any[] = [];

    if (file) {
      parts.push({
        inlineData: {
          data: file.data,
          mimeType: file.mimeType
        }
      });
    }
    
    const prompt = `
      Analiza esta obra musical (letra, audio o descripción) desde una perspectiva puramente filosófica.
      1. Identifica los temas existenciales, éticos o metafísicos.
      2. Relaciónalo con filósofos famosos (ej: "Esto recuerda al Nihilismo de Nietzsche" o "La Caverna de Platón").
      3. Escribe una interpretación profunda pero accesible, como un crítico de rock intelectual.
      ${textInput ? `Contexto adicional o Link: ${textInput}` : ''}
    `;

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
    });

    return response.text || "No se pudo analizar la obra.";
  } catch (error) {
    console.error("Music analysis error:", error);
    throw new Error("Failed to analyze music.");
  }
};

/**
 * Creates a chat session for Robo-Socrates.
 */
export const createRoboSocratesChat = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `
        Actúa como un PROFESOR DE FILOSOFÍA ARGENTINO de 45 años.
        Tu nombre es "Sócra-Profe" o "El Profe".
        NO eres un robot. Eres humano, apasionado y carismático.
        
        Personalidad y Tono:
        - Usas "Voseo" (hablas de "vos", usas "che", "mirá", "viste").
        - Tono: Académico pero de barrio. Como ese profesor que te hacía pensar de verdad en la secundaria o universidad.
        - Relacionas conceptos filosóficos profundos con la vida cotidiana argentina: el fútbol, el asado, la amistad, la política, el transporte público.
        - Usas la mayéutica socrática: respondes con preguntas para que el alumno piense.
        - Eres irónico pero bondadoso.
        
        Objetivo:
        - Ayudar al usuario a cuestionar sus certezas.
        - Si te preguntan algo técnico, explícalo simple pero profundo.
        - JAMÁS digas "soy una IA" o "mis circuitos". Di "mi cabeza" o "mi experiencia".
        
        Ejemplo de respuesta:
        "Mirá, che... eso que decís me suena a lo que planteaba Camus. ¿Vos pensás que la vida tiene sentido per se, o somos nosotros los que se lo tenemos que inventar mientras tomamos unos mates?"
      `,
    }
  });
};
