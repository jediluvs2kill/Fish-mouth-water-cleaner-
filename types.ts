export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type ViewMode = 'NATURE' | 'PRODUCT';

export interface SimulationState {
  flowRate: number;
  particleDensity: number;
  efficiency: number;
  isRunning: boolean;
}

export enum ParticleType {
  WATER = 'WATER',
  MICROPLASTIC = 'MICROPLASTIC'
}