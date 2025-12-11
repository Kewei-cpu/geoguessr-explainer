export interface GeoLocationResult {
  thoughtProcess: string;
  latitude: number;
  longitude: number;
  country: string;
  region?: string;
  confidence: number;
  explanation: string;
  visualCues: string[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface AnalysisError {
  message: string;
}