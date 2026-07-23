import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { EnvironmentService } from '../../core/services/environment.service';
import { GemmaAiService } from '../../core/services/gemma-ai.service';

declare const lucide: any;

interface StateIBGE {
  id: number;
  sigla: string;
  nome: string;
}

interface CityIBGE {
  id: number;
  nome: string;
}

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-container">
      
      <!-- ================= PAINEL DE SELEÇÃO: ESTADOS E MUNICÍPIOS DO IBGE ================= -->
      <div class="reports-config-card glass-panel">
        <div class="panel-header mb-3">
          <div>
            <h3><i data-lucide="file-text" class="inline-icon"></i> Gerador de Relatório Ambiental por IA</h3>
            <p class="panel-subtitle">Selecione qualquer estado e município do Brasil (cobertura total IBGE) para a IA gerar o relatório em texto</p>
          </div>
        </div>

        <div class="filters-grid">
          <!-- 1. Seleção de Estado (Todos os 27 UFs do Brasil) -->
          <div class="filter-box">
            <label class="filter-label"><i data-lucide="map"></i> Estado (UF)</label>
            <select [(ngModel)]="selectedStateSigla" (change)="onStateChange()" class="form-select w-100" [disabled]="loadingStates">
              <option *ngIf="loadingStates" value="">Carregando estados...</option>
              <option *ngFor="let st of statesList" [value]="st.sigla">
                {{ st.nome }} ({{ st.sigla }})
              </option>
            </select>
          </div>

          <!-- 2. Seleção de Município (Todos os municípios do estado selecionado) -->
          <div class="filter-box">
            <label class="filter-label"><i data-lucide="map-pin"></i> Município</label>
            <select [(ngModel)]="selectedCity" class="form-select w-100" [disabled]="loadingCities">
              <option *ngIf="loadingCities" value="">Carregando municípios...</option>
              <option *ngFor="let city of availableCities" [value]="city.nome">
                {{ city.nome }}
              </option>
            </select>
          </div>

          <!-- 3. Período -->
          <div class="filter-box">
            <label class="filter-label"><i data-lucide="calendar"></i> Período Analisado</label>
            <select [(ngModel)]="selectedPeriod" class="form-select w-100">
              <option value="Últimos 7 dias">Últimos 7 dias</option>
              <option value="Último mês (30 dias)">Último mês (30 dias)</option>
              <option value="Último trimestre">Último trimestre</option>
              <option value="Últimos 12 meses">Últimos 12 meses</option>
            </select>
          </div>
        </div>

        <div class="mt-4 display-flex justify-end">
          <button (click)="generateReportWithAI()" [disabled]="gemmaService.isGeneratingReport() || loadingCities" class="btn btn-primary">
            <span *ngIf="gemmaService.isGeneratingReport()"><i data-lucide="loader" class="spin"></i></span>
            <span *ngIf="!gemmaService.isGeneratingReport()"><i data-lucide="sparkles"></i></span>
            <span>{{ gemmaService.isGeneratingReport() ? 'Gerando Relatório com IA...' : 'Gerar Relatório com IA' }}</span>
          </button>
        </div>

      </div>

      <!-- ================= ÁREA DE EXIBIÇÃO DO RELATÓRIO EM TEXTO ================= -->
      <div *ngIf="gemmaService.isGeneratingReport()" class="report-result-card glass-panel mt-4 loading-state">
        <div class="ai-loading-box">
          <div class="sparkle-pulse-avatar">
            <img src="/icon.svg" alt="IA Logo" class="ai-pulse-icon">
          </div>
          <h4>IA Gemma Analisando Dados...</h4>
          <p class="text-sub">Processando indicadores climáticos, dados de queimadas e qualidade do ar para {{ selectedCity }} - {{ selectedStateSigla }}.</p>
        </div>
      </div>

      <div *ngIf="!gemmaService.isGeneratingReport() && gemmaService.currentReportText()" class="report-result-card glass-panel mt-4">
        <div class="report-result-header">
          <div class="title-with-badge">
            <h3><i data-lucide="file-check" class="icon-green"></i> Relatório Ambiental — {{ selectedCity }} ({{ selectedStateSigla }})</h3>
            <span class="badge-ai">Gerado por IA Gemma</span>
          </div>
          <div class="report-actions">
            <button (click)="copyReport()" class="btn btn-glass btn-sm" title="Copiar texto do relatório">
              <i data-lucide="copy"></i> {{ copied ? 'Copiado!' : 'Copiar Texto' }}
            </button>
            <button (click)="downloadReport()" class="btn btn-primary btn-sm" title="Baixar relatório em arquivo de texto">
              <i data-lucide="download"></i> Baixar (.txt)
            </button>
          </div>
        </div>

        <div class="report-meta-bar my-3">
          <span>📍 <strong>Local:</strong> {{ selectedCity }} - {{ selectedStateSigla }}</span>
          <span>📅 <strong>Período:</strong> {{ selectedPeriod }}</span>
          <span>🕒 <strong>Data de Emissão:</strong> {{ gemmaService.currentReportDate() }}</span>
        </div>

        <div class="report-text-content">
          <div class="formatted-text" [innerHTML]="gemmaService.currentReportTextHtml()"></div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .reports-container { display: flex; flex-direction: column; gap: 16px; }
    .inline-icon { vertical-align: middle; margin-right: 6px; width: 18px; height: 18px; color: #2E7D32; }
    .icon-green { color: #2E7D32; margin-right: 8px; }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .filter-box { display: flex; flex-direction: column; gap: 6px; }
    .filter-label { font-size: 0.82rem; font-weight: 600; color: #555; display: flex; align-items: center; gap: 6px; }
    .form-select { padding: 10px 14px; border-radius: 14px; border: 1px solid rgba(46, 125, 50, 0.2); outline: none; background: #FFF; font-weight: 500; }
    .form-select:disabled { opacity: 0.7; cursor: wait; }

    .justify-end { display: flex; justify-content: flex-end; }
    
    .btn-sm { padding: 8px 14px; font-size: 0.8rem; border-radius: 12px; }

    /* Estado de Carregamento da IA */
    .loading-state {
      padding: 40px;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .ai-loading-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      max-width: 420px;
    }
    .sparkle-pulse-avatar {
      width: 60px;
      height: 60px;
      background: #FFF;
      border: 2px solid rgba(46, 125, 50, 0.3);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      box-shadow: 0 0 20px rgba(46, 125, 50, 0.2);
      animation: pulseGlow 1.8s infinite ease-in-out;
    }
    .ai-pulse-icon { width: 100%; height: 100%; object-fit: contain; }
    @keyframes pulseGlow {
      0%, 100% { transform: scale(1); box-shadow: 0 0 16px rgba(46, 125, 50, 0.2); }
      50% { transform: scale(1.08); box-shadow: 0 0 28px rgba(46, 125, 50, 0.4); }
    }

    .spin {
      animation: spinAnimation 1.2s linear infinite;
    }
    @keyframes spinAnimation {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Exibição do Relatório em Texto */
    .report-result-card {
      background: rgba(255, 255, 255, 0.85);
      border: 1.5px solid rgba(46, 125, 50, 0.22);
      border-radius: 24px;
      padding: 28px;
      box-shadow: 0 12px 36px rgba(46, 125, 50, 0.08);
    }
    .report-result-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .title-with-badge { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .title-with-badge h3 { font-size: 1.1rem; font-weight: 700; color: #1C1C1C; margin: 0; }
    .badge-ai { font-size: 0.72rem; font-weight: 700; color: #1565C0; background: rgba(21, 101, 192, 0.1); padding: 4px 10px; border-radius: 999px; }
    
    .report-actions { display: flex; gap: 10px; }

    .report-meta-bar {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      font-size: 0.82rem;
      color: #2E7D32;
      background: rgba(46, 125, 50, 0.08);
      padding: 10px 16px;
      border-radius: 14px;
      border: 1px solid rgba(46, 125, 50, 0.15);
    }

    .report-text-content {
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(46, 125, 50, 0.15);
      border-radius: 16px;
      padding: 24px;
      margin-top: 16px;
    }
    .formatted-text {
      white-space: pre-wrap;
      font-family: 'Poppins', sans-serif;
      font-size: 0.9rem;
      line-height: 1.75;
      color: #2B2B2B;
      margin: 0;
    }

    @media (max-width: 992px) {
      .filters-grid { grid-template-columns: 1fr; }
      .report-result-header { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class ReportsComponent implements OnInit {
  private http = inject(HttpClient);
  private envService = inject(EnvironmentService);
  private apiUrl = 'http://127.0.0.1:8000/api';
  private ibgeUrl = 'https://servicodados.ibge.gov.br/api/v1/localidades';

  statesList: StateIBGE[] = [];
  availableCities: CityIBGE[] = [];

  selectedStateSigla = 'SP';
  selectedCity = 'São Paulo';
  selectedPeriod = 'Últimos 7 dias';

  loadingStates = true;
  loadingCities = false;
  isGenerating = false; // local UI lock flag, optional, but we can bind to service
  copied = false;

  gemmaService = inject(GemmaAiService);

  constructor() {
    effect(() => {
      const globalCity = this.envService.selectedCity();
      if (globalCity) {
        const parts = globalCity.split('-');
        if (parts.length >= 2) {
          const newCity = parts[0].trim();
          const newState = parts[1].trim();
          
          if (this.selectedStateSigla !== newState) {
            this.selectedStateSigla = newState;
            this.fetchCities(this.selectedStateSigla);
          }
          this.selectedCity = newCity;
        }
      }
    });
  }

  ngOnInit(): void {
    this.fetchStates();
  }

  fetchStates(): void {
    this.loadingStates = true;
    this.http.get<StateIBGE[]>(`${this.ibgeUrl}/estados?orderBy=nome`)
      .pipe(
        catchError(() => {
          return of([
            { id: 12, sigla: 'AC', nome: 'Acre' },
            { id: 13, sigla: 'AM', nome: 'Amazonas' },
            { id: 51, sigla: 'MT', nome: 'Mato Grosso' },
            { id: 15, sigla: 'PA', nome: 'Pará' },
            { id: 11, sigla: 'RO', nome: 'Rondônia' },
            { id: 35, sigla: 'SP', nome: 'São Paulo' },
            { id: 33, sigla: 'RJ', nome: 'Rio de Janeiro' }
          ]);
        })
      )
      .subscribe(states => {
        this.statesList = states;
        this.loadingStates = false;
        if (states.length > 0) {
          if (!this.selectedStateSigla) {
            this.selectedStateSigla = states[0].sigla;
          }
          this.fetchCities(this.selectedStateSigla);
        }
      });
  }

  onStateChange(): void {
    if (this.selectedStateSigla) {
      this.fetchCities(this.selectedStateSigla);
    }
  }

  fetchCities(uf: string): void {
    this.loadingCities = true;
    this.http.get<CityIBGE[]>(`${this.ibgeUrl}/estados/${uf}/municipios?orderBy=nome`)
      .pipe(
        catchError(() => {
          return of([
            { id: 1, nome: 'Rio Branco' },
            { id: 2, nome: 'Cruzeiro do Sul' }
          ]);
        })
      )
      .subscribe(cities => {
        this.availableCities = cities;
        this.loadingCities = false;
        if (cities.length > 0) {
          const cityExists = cities.find(c => c.nome === this.selectedCity);
          
          if (!cityExists) {
            if (uf === 'SP') {
              const capital = cities.find(c => c.nome === 'São Paulo');
              this.selectedCity = capital ? capital.nome : cities[0].nome;
            } else {
              this.selectedCity = cities[0].nome;
            }
          }
        }
      });
  }

  generateReportWithAI(): void {
    if (!this.selectedCity || !this.selectedStateSigla) return;
    this.copied = false;
    this.gemmaService.generateReport(this.selectedCity, this.selectedStateSigla, this.selectedPeriod);
    setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }, 50);
  }

  copyReport(): void {
    const textToCopy = this.gemmaService.currentReportText();
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        this.copied = true;
        setTimeout(() => this.copied = false, 3000);
      });
    }
  }

  downloadReport(): void {
    const text = this.gemmaService.currentReportText();
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-ambiental-${this.selectedCity}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private refreshIcons(): void {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 100);
  }
}
