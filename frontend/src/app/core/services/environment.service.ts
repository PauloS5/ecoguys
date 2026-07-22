import { Injectable, signal } from '@angular/core';
import { EnvironmentalIndicator, EnvironmentalAlert } from '../models/environment.model';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  selectedCity = signal<string>('Rio Branco - AC');

  indicators = signal<EnvironmentalIndicator[]>([
    { id: '1', name: 'Temperatura', value: '--', unit: '°C', status: 'info', icon: 'thermometer', category: 'temperature' },
    { id: '2', name: 'Umidade Relativa', value: '--', unit: '%', status: 'info', icon: 'droplets', category: 'humidity' },
    { id: '3', name: 'Precipitação', value: '--', unit: 'mm', status: 'info', icon: 'cloud-rain', category: 'rain' },
    { id: '4', name: 'Velocidade do Vento', value: '--', unit: 'km/h', status: 'info', icon: 'wind', category: 'wind' },
    { id: '5', name: 'Qualidade do Ar', value: '--', unit: 'AQI', status: 'info', icon: 'activity', category: 'aqi' },
    { id: '6', name: 'Índice UV', value: '--', unit: '', status: 'info', icon: 'sun', category: 'uv' },
    { id: '7', name: 'Nível de Rios', value: '--', unit: 'm', status: 'info', icon: 'waves', category: 'river' },
    { id: '8', name: 'Focos de Queimadas', value: '--', unit: 'focos', status: 'info', icon: 'flame', category: 'fire' },
    { id: '9', name: 'Cobertura Vegetal', value: '--', unit: '%', status: 'info', icon: 'trees', category: 'vegetation' }
  ]);

  alerts = signal<EnvironmentalAlert[]>([]);

  updateCity(city: string): void {
    this.selectedCity.set(city);
  }
}
