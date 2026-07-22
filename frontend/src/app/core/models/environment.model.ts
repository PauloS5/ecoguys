export interface EnvironmentalIndicator {
  id: string;
  name: string;
  value: string | number;
  unit: string;
  status: 'normal' | 'warning' | 'critical' | 'info';
  icon: string;
  category: 'temperature' | 'humidity' | 'rain' | 'wind' | 'aqi' | 'uv' | 'river' | 'fire' | 'vegetation';
}

export interface EnvironmentalAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  location: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'gemma';
  text: string;
  timestamp: Date;
}

export interface AutomaticReport {
  id: string;
  title: string;
  location: string;
  dateGenerated: string;
  periodAnalyzed: string;
  summary: string;
  changes: string;
  risks: string;
  recommendations: string;
  trends: string;
}

export interface MapNavigationState {
  level: 'country' | 'state' | 'municipality';
  stateName?: string;
  stateCode?: string;
  municipalityName?: string;
  municipalityCode?: string;
}
