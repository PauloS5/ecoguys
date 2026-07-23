import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvironmentalIndicator, EnvironmentalAlert } from '../models/environment.model';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/v1';

  selectedCity = signal<string>('São Paulo - SP');
  mobileMenuOpen = signal<boolean>(false);

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

  constructor() {
    this.fetchData(this.selectedCity());
  }

  updateCity(city: string): void {
    this.selectedCity.set(city);
    this.fetchData(city);
  }

  fetchData(city: string): void {
    this.http.get<EnvironmentalIndicator[]>(`${this.apiUrl}/indicators?city=${encodeURIComponent(city)}`)
      .pipe(
        catchError(() => {
          return of([]);
        })
      )
      .subscribe(data => {
        if (data && data.length > 0) {
          this.indicators.set(data);
        } else {
          // Reset to default if API fails or returns empty
          this.indicators.set([
            { id: '1', name: 'Temperatura', value: '--', unit: '°C', status: 'info', icon: 'thermometer', category: 'temperature' },
            { id: '2', name: 'Umidade Relativa', value: '--', unit: '%', status: 'info', icon: 'droplets', category: 'humidity' },
            { id: '3', name: 'Precipitação (1h)', value: '--', unit: 'mm', status: 'info', icon: 'cloud-rain', category: 'rain' },
            { id: '4', name: 'Vento', value: '--', unit: 'km/h', status: 'info', icon: 'wind', category: 'wind' },
            { id: '5', name: 'Qualidade do Ar', value: '--', unit: 'AQI', status: 'info', icon: 'activity', category: 'aqi' },
            { id: '6', name: 'Sensação Térmica', value: '--', unit: '°C', status: 'info', icon: 'sun-dim', category: 'uv' },
            { id: '7', name: 'Pressão Atmosférica', value: '--', unit: 'hPa', status: 'info', icon: 'gauge', category: 'river' },
            { id: '8', name: 'Nebulosidade', value: '--', unit: '%', status: 'info', icon: 'cloud', category: 'fire' },
            { id: '9', name: 'Visibilidade', value: '--', unit: 'km', status: 'info', icon: 'eye', category: 'vegetation' }
          ]);
        }
      });

    this.http.get<EnvironmentalAlert[]>(`${this.apiUrl}/alerts?city=${encodeURIComponent(city)}`)
      .pipe(
        catchError(() => {
          return of([]);
        })
      )
      .subscribe(data => {
        this.alerts.set(data || []);
      });
  }
}
