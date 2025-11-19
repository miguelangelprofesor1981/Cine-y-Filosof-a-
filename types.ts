
export enum ImageStyle {
  HOLLYWOOD = 'HOLLYWOOD',
  MEME = 'MEME',
}

export enum CinemaGenre {
  EPIC = 'EPIC',         // Blockbuster, Photorealistic
  INDIE = 'INDIE',       // A24, Abstract, Symbolic
  RETRO = 'RETRO',       // 70s/80s, Painted, Grainy
  NOIR = 'NOIR',         // B&W, Shadowy
  SCIFI = 'SCIFI',       // Neon, Surreal, Geometric
}

export enum AppSection {
  CINEMA = 'CINEMA',
  MUSIC_HALL = 'MUSIC_HALL',
  ROBO_SOCRATES = 'ROBO_SOCRATES',
}

export interface GenerationResult {
  imageUrl: string;
  originalPrompt: string;
  enhancedPrompt: string;
  movieMetadata?: {
    title: string;
    actors: string;
  };
}

export interface AudioRecorderState {
  isRecording: boolean;
  audioBlob: Blob | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  TRANSCRIBING = 'TRANSCRIBING',
  ENHANCING_PROMPT = 'ENHANCING_PROMPT',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  ANALYZING_MUSIC = 'ANALYZING_MUSIC',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}
