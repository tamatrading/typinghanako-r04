export interface GameSettings {
  selectedStages: number[];
  speed: number;
  isRandomMode: boolean;
  numStages: number;
  showHands: boolean;
  windowSize: number;
}

export interface ScorePopup {
  id: number;
  score: number;
  x: number;
  y: number;
}

export interface CurrentWord {
  id: number;
  text: string;
  x: number;
  y: number;
  speed: number;
  startTime: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}