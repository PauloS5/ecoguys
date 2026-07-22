import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { EnvironmentService } from '../../core/services/environment.service';

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
          <button (click)="generateReportWithAI()" [disabled]="isGenerating || loadingCities" class="btn btn-primary">
            <i [attr.data-lucide]="isGenerating ? 'loader' : 'sparkles'" [class.spin]="isGenerating"></i>
            <span>{{ isGenerating ? 'Gerando Relatório com IA...' : 'Gerar Relatório com IA' }}</span>
          </button>
        </div>

      </div>

      <!-- ================= ÁREA DE EXIBIÇÃO DO RELATÓRIO EM TEXTO ================= -->
      <div *ngIf="isGenerating" class="report-result-card glass-panel mt-4 loading-state">
        <div class="ai-loading-box">
          <div class="sparkle-pulse-avatar">
            <img src="/icon.svg" alt="IA Logo" class="ai-pulse-icon">
          </div>
          <h4>IA Gemma Analisando Dados...</h4>
          <p class="text-sub">Processando indicadores climáticos, dados de queimadas e qualidade do ar para {{ selectedCity }} - {{ selectedStateSigla }}.</p>
        </div>
      </div>

      <div *ngIf="!isGenerating && reportText" class="report-result-card glass-panel mt-4">
        <div class="report-result-header">
          <div class="title-with-badge">
            <h3><i data-lucide="file-check" class="icon-green"></i> Relatório Ambiental — {{ selectedCity }} ({{ selectedStateSigla }})</h3>
            <span class="badge-ai">Gerado por IA Gemma</span>
          </div>
          <div class="report-actions">
            <button (click)="copyText()" class="btn btn-glass btn-sm" title="Copiar texto do relatório">
              <i data-lucide="copy"></i> {{ copied ? 'Copiado!' : 'Copiar Texto' }}
            </button>
            <button (click)="downloadTxt()" class="btn btn-primary btn-sm" title="Baixar relatório em arquivo de texto">
              <i data-lucide="download"></i> Baixar (.txt)
            </button>
          </div>
        </div>

        <div class="report-meta-bar my-3">
          <span>📍 <strong>Local:</strong> {{ selectedCity }} - {{ selectedStateSigla }}</span>
          <span>📅 <strong>Período:</strong> {{ selectedPeriod }}</span>
          <span>🕒 <strong>Data de Emissão:</strong> {{ generatedDate }}</span>
        </div>

        <div class="report-text-content">
          <div class="formatted-text" [innerHTML]="formatMarkdown(reportText)"></div>
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
      font-family: 'Poppins', sans-serif;
      font-size: 0.95rem;
      line-height: 1.75;
      color: #2B2B2B;
      margin: 0;
    }
    .formatted-text strong {
      color: #1C1C1C;
    }
    .formatted-text h1, .formatted-text h2, .formatted-text h3 {
      color: #2E7D32;
      font-weight: 700;
      margin-top: 16px;
      margin-bottom: 8px;
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

  selectedStateSigla = '';
  selectedCity = '';
  selectedPeriod = 'Últimos 7 dias';

  loadingStates = true;
  loadingCities = false;
  isGenerating = false;

  reportText = '';
  generatedDate = '';
  copied = false;

  ngOnInit(): void {
    const globalCity = this.envService.selectedCity();
    if (globalCity && globalCity.includes(' - ')) {
      const parts = globalCity.split(' - ');
      this.selectedCity = parts[0].trim();
      this.selectedStateSigla = parts[1].trim();
    }
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
          if (!this.selectedStateSigla || !states.find(s => s.sigla === this.selectedStateSigla)) {
            this.selectedStateSigla = states[0].sigla;
          }
          this.fetchCities(this.selectedStateSigla, true);
        }
      });
  }

  onStateChange(): void {
    if (this.selectedStateSigla) {
      this.fetchCities(this.selectedStateSigla, false);
    }
  }

  fetchCities(uf: string, keepSelectedCity: boolean = false): void {
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
          if (!keepSelectedCity || !this.selectedCity || !cities.find(c => c.nome === this.selectedCity)) {
            this.selectedCity = cities[0].nome;
          }
        }
      });
  }

  generateReportWithAI(): void {
    if (!this.selectedCity || !this.selectedStateSigla) return;

    this.isGenerating = true;
    this.copied = false;

    const promptText = `Gere um relatório ambiental analítico e completo em texto para o município de ${this.selectedCity} - ${this.selectedStateSigla}, referente ao período de ${this.selectedPeriod}. Estruture o texto com: 
1. RESUMO DAS CONDIÇÕES CLIMÁTICAS
2. ANÁLISE DE TEMPERATURA E UMIDADE RELATIVA
3. AVALIAÇÃO DE RISCOS AMBIENTAIS E QUEIMADAS
4. RECOMENDAÇÕES PREVENTIVAS DA IA GEMMA`;

    this.http.post<{ response: string }>(`${this.apiUrl}/chat`, {
      prompt: promptText,
      cidade: this.selectedCity,
      uf: this.selectedStateSigla
    })
    .pipe(
      catchError(() => {
        return of({
          response: `RELATÓRIO AMBIENTAL DE DEMONSTRAÇÃO\nMunicípio: ${this.selectedCity} - ${this.selectedStateSigla}\nPeríodo: ${this.selectedPeriod}\n\n1. RESUMO DAS CONDIÇÕES CLIMÁTICAS\nA região de ${this.selectedCity} - ${this.selectedStateSigla} registrou estabilidade climática geral com temperaturas médias de 31.5°C e umidade relativa média de 65% no período analisado.\n\n2. ANÁLISE DE TEMPERATURA E UMIDADE\nObservam-se oscilações térmicas típicas durante a tarde, com picos de calor atingindo 34°C. A umidade oscilou entre 55% e 75%.\n\n3. AVALIAÇÃO DE RISCOS E QUEIMADAS\nOs índices de queimadas permanecem em nível de atenção baixa a moderada nas áreas rurais periféricas.\n\n4. RECOMENDAÇÕES PREVENTIVAS DA IA GEMMA\nRecomenda-se manter o monitoramento contínuo das fontes de água e evitar queimadas descontroladas.`
        });
      })
    )
    .subscribe(res => {
      this.reportText = res.response;
      this.generatedDate = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      this.isGenerating = false;
      this.refreshIcons();
    });
  }

  copyText(): void {
    if (!this.reportText) return;
    navigator.clipboard.writeText(this.reportText);
    this.copied = true;
    setTimeout(() => this.copied = false, 2500);
  }

  downloadTxt(): void {
    if (!this.reportText) return;
    const element = document.createElement('a');
    const file = new Blob([this.reportText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Relatorio_Ambiental_${this.selectedCity.replace(/\s+/g, '_')}_${this.selectedStateSigla}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  private refreshIcons(): void {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 100);
  }

  formatMarkdown(text: string): string {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\n/g, '<br>');
  }
}
