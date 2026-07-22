import { Component, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { EnvironmentService } from '../../core/services/environment.service';

declare const lucide: any;
declare const Chart: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- SKELETON LOADER (Telas de carregamento lento/internet lenta) -->
    <div *ngIf="isLoading" class="dashboard-grid-layout">
      <div class="dashboard-center-column">
        <!-- Shimmer Hero -->
        <div class="hero-gemma-card glass-panel shimmer-container">
          <div class="shimmer-avatar shimmer"></div>
          <div class="shimmer-content-col">
            <div class="shimmer-badge-line shimmer"></div>
            <div class="shimmer-title-line shimmer"></div>
            <div class="shimmer-text-line shimmer"></div>
          </div>
        </div>

        <div class="section-header mt-4 mb-3">
          <div class="shimmer-header-title shimmer"></div>
        </div>

        <!-- Shimmer Metrics (9 Cards) -->
        <div class="metrics-grid-9">
          <div *ngFor="let item of [1,2,3,4,5,6,7,8,9]" class="metric-card glass-card shimmer-container">
            <div class="shimmer-metric-header">
              <div class="shimmer-label shimmer"></div>
              <div class="shimmer-icon shimmer"></div>
            </div>
            <div class="shimmer-metric-value shimmer"></div>
          </div>
        </div>

        <!-- Shimmer Chart -->
        <div class="chart-panel glass-panel mt-4 shimmer-container">
          <div class="shimmer-chart-header shimmer"></div>
          <div class="shimmer-chart-box shimmer"></div>
        </div>
      </div>

      <aside class="dashboard-right-column">
        <div class="alerts-large-card glass-panel shimmer-container">
          <div class="shimmer-sidebar-header shimmer"></div>
          <div class="shimmer-sidebar-box shimmer mt-3"></div>
          <div class="shimmer-sidebar-box shimmer mt-3"></div>
        </div>
      </aside>
    </div>

    <!-- DASHBOARD REAL (Carregado com Sucesso) -->
    <div *ngIf="!isLoading" class="dashboard-grid-layout">

      <!-- ================= PARTE 2: CENTRO DA TELA ================= -->
      <div class="dashboard-center-column">

        <!-- Hero Card Gemma AI -->
        <div class="hero-gemma-card glass-panel">
          <div class="gemma-avatar-box">
            <div class="gemma-avatar">
              <i data-lucide="sparkles"></i>
            </div>
          </div>
          <div class="gemma-content">
            <div class="gemma-badge">
              <i data-lucide="zap"></i> RESUMO INTELIGENTE
            </div>
            <h2 class="gemma-title">Análise Ambiental — {{ envService.selectedCity() }}</h2>
            <p class="gemma-text">
              Análise dos dados monitorados em tempo real com tradução facilitada pela inteligência artificial.
            </p>
            <div class="gemma-actions">
              <a routerLink="/assistente" class="btn btn-primary">
                <i data-lucide="message-square"></i> Perguntar ao Assistente
              </a>
              <a routerLink="/relatorios" class="btn btn-glass">
                <i data-lucide="file-text"></i> Emitir Relatório
              </a>
            </div>
          </div>
        </div>

        <!-- Grade dos 9 Indicadores Ambientais -->
        <div class="section-header mt-4 mb-3">
          <h3 class="section-title">Indicadores Ambientais — {{ envService.selectedCity() }}</h3>
          <span class="badge-count">9 Indicadores Monitorados</span>
        </div>
        
        <div class="metrics-grid-9">
          <div *ngFor="let item of envService.indicators()" class="metric-card glass-card">
            <div class="metric-header">
              <span class="metric-label">{{ item.name }}</span>
              <div class="metric-icon-box {{ item.category }}">
                <i [attr.data-lucide]="item.icon"></i>
              </div>
            </div>
            <div class="metric-value-group">
              <span class="metric-value">{{ item.value }} <small>{{ item.unit }}</small></span>
            </div>
          </div>
        </div>

        <!-- Evolução dos Indicadores (Gráfico de Barras + Curva Suave - Estilo Referência) -->
        <div class="chart-panel glass-panel mt-4">
          <div class="panel-header mb-3">
            <div>
              <h3><i data-lucide="bar-chart-3" class="inline-icon"></i> Environmental Analytics</h3>
              <p class="panel-subtitle">Análise histórica mensal com barras arredondadas e curva de tendência</p>
            </div>
          </div>
          <div class="chart-container-box">
            <canvas id="historicalChart"></canvas>
          </div>
        </div>

        <!-- Linha de Gráficos Rosca (Doughnut Charts - Estilo Referência) -->
        <div class="dashboard-doughnuts-row mt-4">
          
          <div class="doughnut-card glass-panel">
            <h4 class="doughnut-title"><i data-lucide="pie-chart"></i> Cobertura de Pontos</h4>
            <div class="doughnut-body">
              <div class="doughnut-canvas-box">
                <canvas id="doughnutChart1"></canvas>
                <div class="doughnut-center-label">
                  <span class="center-percent">70%</span>
                  <span class="center-sub">Pontos</span>
                </div>
              </div>
              <div class="doughnut-legend-list">
                <div class="legend-item"><span class="dot green"></span> Monitorado (70%)</div>
                <div class="legend-item"><span class="dot light-green"></span> Em análise (20%)</div>
                <div class="legend-item"><span class="dot muted"></span> Futuro (10%)</div>
              </div>
            </div>
          </div>

          <div class="doughnut-card glass-panel">
            <h4 class="doughnut-title"><i data-lucide="activity"></i> Distribuição de Risco</h4>
            <div class="doughnut-body">
              <div class="doughnut-canvas-box">
                <canvas id="doughnutChart2"></canvas>
                <div class="doughnut-center-label">
                  <span class="center-percent">30%</span>
                  <span class="center-sub">Ativos</span>
                </div>
              </div>
              <div class="doughnut-legend-list">
                <div class="legend-item"><span class="dot green"></span> Qualidade do Ar (38.4%)</div>
                <div class="legend-item"><span class="dot emerald"></span> Temperatura (10.3%)</div>
                <div class="legend-item"><span class="dot lime"></span> Umidade (5.3%)</div>
                <div class="legend-item"><span class="dot soft"></span> Outros (3.0%)</div>
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- ================= PARTE 3: CARD GRANDE DE AVISOS (DIREITA) ================= -->
      <aside class="dashboard-right-column">
        <div class="alerts-large-card glass-panel">
          
          <!-- Topo do Card de Avisos -->
          <div class="alerts-header">
            <div class="alerts-title-group">
              <div class="pulse-dot-green"></div>
              <h3>Alertas & Avisos</h3>
            </div>
            <span class="alerts-count-badge">{{ envService.alerts().length }} Ativos</span>
          </div>

          <p class="panel-subtitle mb-3">Monitoramento contínuo em {{ envService.selectedCity() }}</p>

          <div class="panel-divider mb-3"></div>

          <!-- Seção Principal: Alertas Ativos ou Estado Limpo -->
          <div class="alerts-content-section">
            
            <!-- Estado Quando NÃO Há Alertas Ativos -->
            <div *ngIf="envService.alerts().length === 0" class="empty-alerts-state">
              <div class="safe-icon-circle">
                <i data-lucide="shield-check"></i>
              </div>
              <h4>Nenhum Alerta Crítico</h4>
              <p class="text-sub small">
                Todos os parâmetros ambientais monitorados estão operando dentro da faixa de normalidade.
              </p>
            </div>

            <!-- Lista de Alertas Reais -->
            <div *ngIf="envService.alerts().length > 0" class="alerts-list">
              <div *ngFor="let alert of envService.alerts()" class="alert-card-item {{ alert.severity }}">
                <div class="alert-item-header">
                  <span class="alert-title">{{ alert.title }}</span>
                  <span class="severity-tag {{ alert.severity }}">{{ alert.severity }}</span>
                </div>
                <p class="alert-desc">{{ alert.description }}</p>
                <div class="alert-footer">
                  <span><i data-lucide="map-pin"></i> {{ alert.location }}</span>
                  <span><i data-lucide="clock"></i> {{ alert.timestamp }}</span>
                </div>
              </div>
            </div>

          </div>

          <div class="panel-divider my-3"></div>

          <!-- Parecer Inteligente da IA Gemma -->
          <div class="gemma-notice-card">
            <div class="notice-header">
              <i data-lucide="sparkles"></i>
              <span>Parecer da IA Gemma</span>
            </div>
            <p class="notice-text">
              Acompanhe a umidade relativa e o índice UV durante o período da tarde. Nenhuma anomalia grave registrada.
            </p>
          </div>

          <div class="panel-divider my-3"></div>

          <!-- Atalho para Gestão de Limites -->
          <a routerLink="/alertas" class="btn btn-glass btn-block">
            <i data-lucide="sliders"></i> Configurar Limites de Alerta
          </a>

        </div>
      </aside>

    </div>
  `,
  styles: [`
    /* Layout em Colunas (Centro + Card Grande Direito) */
    .dashboard-grid-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 20px;
      align-items: start;
    }

    /* Coluna Central */
    .dashboard-center-column {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Hero Gemma Card */
    .hero-gemma-card {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 28px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(235, 247, 236, 0.9) 100%);
      border: 1.5px solid rgba(46, 125, 50, 0.25);
      border-radius: 24px;
      box-shadow: 0 10px 30px rgba(46, 125, 50, 0.08);
    }
    .gemma-avatar {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #2E7D32, #1B5E20);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFF;
      box-shadow: 0 8px 22px rgba(46, 125, 50, 0.35);
    }
    .gemma-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      color: #2E7D32;
      background: rgba(46, 125, 50, 0.12);
      padding: 5px 12px;
      border-radius: 999px;
      margin-bottom: 8px;
    }
    .gemma-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 6px; color: #1C1C1C; }
    .gemma-text { font-size: 0.88rem; color: #666; margin-bottom: 16px; line-height: 1.5; }
    .gemma-actions { display: flex; gap: 12px; flex-wrap: wrap; }

    /* Indicadores */
    .section-header { display: flex; align-items: center; justify-content: space-between; }
    .section-title { font-size: 1.05rem; font-weight: 700; color: #1C1C1C; }
    .badge-count { font-size: 0.75rem; font-weight: 600; color: #2E7D32; background: rgba(46, 125, 50, 0.1); padding: 4px 12px; border-radius: 999px; }
    .metrics-grid-9 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .metric-card {
      background: rgba(255, 255, 255, 0.78);
      border: 1px solid rgba(46, 125, 50, 0.18);
      border-radius: 20px;
      padding: 20px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .metric-card:hover {
      background: rgba(255, 255, 255, 0.95);
      border-color: rgba(46, 125, 50, 0.4);
      transform: translateY(-4px);
      box-shadow: 0 14px 32px rgba(46, 125, 50, 0.14);
    }
    .metric-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .metric-label { font-size: 0.78rem; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .metric-icon-box { width: 40px; height: 40px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
    .metric-icon-box.temperature { background: rgba(245, 124, 0, 0.12); color: #F57C00; }
    .metric-icon-box.humidity { background: rgba(21, 101, 192, 0.12); color: #1565C0; }
    .metric-icon-box.rain { background: rgba(2, 136, 209, 0.12); color: #0288D1; }
    .metric-icon-box.wind { background: rgba(0, 150, 136, 0.12); color: #009688; }
    .metric-icon-box.aqi { background: rgba(124, 77, 255, 0.12); color: #7C4DFF; }
    .metric-icon-box.uv { background: rgba(255, 179, 0, 0.12); color: #FFB300; }
    .metric-icon-box.river { background: rgba(3, 169, 244, 0.12); color: #03A9F4; }
    .metric-icon-box.fire { background: rgba(211, 47, 47, 0.12); color: #D32F2F; }
    .metric-icon-box.vegetation { background: rgba(46, 125, 50, 0.12); color: #2E7D32; }
    .metric-value { font-size: 1.7rem; font-weight: 700; color: #1C1C1C; }
    .metric-value small { font-size: 0.9rem; font-weight: 500; color: #888; }

    /* Gráficos */
    .inline-icon { vertical-align: middle; margin-right: 6px; width: 18px; height: 18px; color: #2E7D32; }
    .chart-container-box { height: 260px; position: relative; width: 100%; }

    /* Linha de Gráficos Rosca */
    .dashboard-doughnuts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .doughnut-card {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .doughnut-title {
      font-size: 0.92rem;
      font-weight: 700;
      color: #1C1C1C;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .doughnut-body {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .doughnut-canvas-box {
      width: 110px;
      height: 110px;
      position: relative;
      flex-shrink: 0;
    }
    .doughnut-center-label {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }
    .center-percent { font-size: 1.1rem; font-weight: 800; color: #2E7D32; line-height: 1; }
    .center-sub { font-size: 0.65rem; color: #888; font-weight: 600; }
    .doughnut-legend-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 0.78rem;
      color: #555;
    }
    .legend-item { display: flex; align-items: center; gap: 8px; font-weight: 500; }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .dot.green { background: #2E7D32; }
    .dot.emerald { background: #4CAF50; }
    .dot.lime { background: #81C784; }
    .dot.light-green { background: #A5D6A7; }
    .dot.soft { background: #C8E6C9; }
    .dot.muted { background: #E0E0E0; }

    /* Coluna Direita: Card Grande de Avisos */
    .dashboard-right-column {
      position: sticky;
      top: 88px;
    }
    .alerts-large-card {
      display: flex;
      flex-direction: column;
      padding: 28px 24px;
      border: 1.5px solid rgba(46, 125, 50, 0.25);
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.82);
      backdrop-filter: blur(20px);
      box-shadow: 0 12px 36px rgba(46, 125, 50, 0.1);
      min-height: 520px;
    }
    .alerts-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    .alerts-title-group { display: flex; align-items: center; gap: 10px; }
    .alerts-title-group h3 { font-size: 1.1rem; font-weight: 700; color: #1C1C1C; }
    .pulse-dot-green { width: 10px; height: 10px; background: #00E676; border-radius: 50%; box-shadow: 0 0 10px #00E676; }
    .alerts-count-badge { font-size: 0.72rem; font-weight: 700; color: #2E7D32; background: rgba(46, 125, 50, 0.12); padding: 3px 10px; border-radius: 999px; }
    
    .panel-divider { height: 1px; background: rgba(220, 226, 235, 0.8); width: 100%; }
    .my-3 { margin-top: 14px; margin-bottom: 14px; }

    .alerts-content-section { flex: 1; display: flex; flex-direction: column; justify-content: center; }

    /* Estado de Sem Alertas */
    .empty-alerts-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 28px 16px;
      background: rgba(56, 142, 60, 0.04);
      border: 1px solid rgba(56, 142, 60, 0.15);
      border-radius: 20px;
    }
    .safe-icon-circle {
      width: 52px;
      height: 52px;
      background: rgba(56, 142, 60, 0.12);
      color: #2E7D32;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      font-size: 1.4rem;
    }
    .empty-alerts-state h4 { font-size: 0.95rem; font-weight: 700; color: #2E7D32; margin-bottom: 4px; }

    /* Lista de Alertas */
    .alerts-list { display: flex; flex-direction: column; gap: 10px; }
    .alert-card-item {
      padding: 14px;
      border-radius: 16px;
      background: #FFF;
      border: 1px solid rgba(220, 226, 235, 0.8);
    }
    .alert-card-item.critical { border-left: 4px solid #D32F2F; background: rgba(211, 47, 47, 0.04); }
    .alert-card-item.warning { border-left: 4px solid #F57C00; background: rgba(245, 124, 0, 0.04); }
    .alert-item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .alert-title { font-size: 0.85rem; font-weight: 700; }
    .severity-tag { font-size: 0.65rem; text-transform: uppercase; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
    .severity-tag.critical { background: #D32F2F; color: #FFF; }
    .severity-tag.warning { background: #F57C00; color: #FFF; }
    .alert-desc { font-size: 0.78rem; color: #666; margin-bottom: 8px; }
    .alert-footer { display: flex; gap: 12px; font-size: 0.72rem; color: #999; }

    /* Parecer IA Gemma */
    .gemma-notice-card {
      background: linear-gradient(135deg, rgba(46, 125, 50, 0.08) 0%, rgba(21, 101, 192, 0.06) 100%);
      border: 1px solid rgba(46, 125, 50, 0.2);
      border-radius: 16px;
      padding: 16px;
    }
    .notice-header { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 700; color: #2E7D32; margin-bottom: 6px; }
    .notice-text { font-size: 0.8rem; color: #444; line-height: 1.45; }

    .btn-block { width: 100%; text-decoration: none; justify-content: center; }

    /* ===== SKELETON / SHIMMER EFFECTS ===== */
    .shimmer-container { overflow: hidden; position: relative; }
    .shimmer {
      background: linear-gradient(90deg, rgba(46, 125, 50, 0.06) 25%, rgba(46, 125, 50, 0.15) 50%, rgba(46, 125, 50, 0.06) 75%);
      background-size: 200% 100%;
      animation: shimmerAnimation 1.5s infinite;
      border-radius: 12px;
    }
    @keyframes shimmerAnimation {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    .shimmer-avatar { width: 64px; height: 64px; border-radius: 20px; }
    .shimmer-content-col { display: flex; flex-direction: column; gap: 8px; flex: 1; }
    .shimmer-badge-line { width: 120px; height: 16px; }
    .shimmer-title-line { width: 60%; height: 22px; }
    .shimmer-text-line { width: 85%; height: 14px; }
    .shimmer-header-title { width: 220px; height: 20px; }
    
    .shimmer-metric-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
    .shimmer-label { width: 80px; height: 12px; }
    .shimmer-icon { width: 34px; height: 34px; border-radius: 10px; }
    .shimmer-metric-value { width: 120px; height: 28px; }

    .shimmer-chart-header { width: 300px; height: 22px; margin-bottom: 14px; }
    .shimmer-chart-box { width: 100%; height: 240px; }
    
    .shimmer-sidebar-header { width: 150px; height: 24px; }
    .shimmer-sidebar-box { width: 100%; height: 120px; }

    /* ===== Media Queries Responsivos ===== */
    @media (max-width: 1280px) {
      .dashboard-grid-layout {
        grid-template-columns: 1fr;
      }
      .dashboard-right-column {
        position: static;
      }
    }

    @media (max-width: 992px) {
      .metrics-grid-9 {
        grid-template-columns: repeat(2, 1fr);
      }
      .dashboard-doughnuts-row {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 600px) {
      .metrics-grid-9 {
        grid-template-columns: 1fr;
      }
      .hero-gemma-card {
        flex-direction: column;
        text-align: center;
        padding: 20px;
      }
      .gemma-actions {
        justify-content: center;
        width: 100%;
      }
      .doughnut-body {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  envService = inject(EnvironmentService);
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/v1';

  isLoading = true;

  private mainChartInstance: any;
  private doughnut1Instance: any;
  private doughnut2Instance: any;

  ngAfterViewInit(): void {
    // Simula 1.2 segundos de atraso de rede lenta antes de carregar o Dashboard
    setTimeout(() => {
      this.isLoading = false;
      
      // Inicializa os ícones do Lucide
      setTimeout(() => {
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
        this.initCharts();
      }, 50);

    }, 1200);
  }

  ngOnDestroy(): void {
    if (this.mainChartInstance) this.mainChartInstance.destroy();
    if (this.doughnut1Instance) this.doughnut1Instance.destroy();
    if (this.doughnut2Instance) this.doughnut2Instance.destroy();
  }

  private initCharts(): void {
    if (typeof Chart === 'undefined') return;

    const city = this.envService.selectedCity();

    // 1. Carrega dados do Gráfico Histórico Híbrido da API
    this.http.get<any>(`${this.apiUrl}/charts/historical?city=${encodeURIComponent(city)}`)
      .pipe(
        catchError(() => {
          // Fallback seguro de dados vazios ou mínimos se o backend estiver inacessível
          return of({
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            lineData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            barData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          });
        })
      )
      .subscribe(res => {
        const mainCanvas = document.getElementById('historicalChart') as HTMLCanvasElement;
        if (mainCanvas) {
          if (this.mainChartInstance) this.mainChartInstance.destroy();

          this.mainChartInstance = new Chart(mainCanvas, {
            data: {
              labels: res.labels || ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
              datasets: [
                {
                  type: 'line',
                  label: 'Tendência de Indicadores',
                  data: res.lineData || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  borderColor: '#2E7D32',
                  backgroundColor: 'rgba(76, 175, 80, 0.15)',
                  borderWidth: 3,
                  tension: 0.45,
                  fill: true,
                  pointBackgroundColor: '#2E7D32',
                  pointBorderColor: '#FFF',
                  pointBorderWidth: 2,
                  pointRadius: 4,
                  order: 1
                },
                {
                  type: 'bar',
                  label: 'Volume Monitorado',
                  data: res.barData || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  backgroundColor: 'rgba(46, 125, 50, 0.8)',
                  hoverBackgroundColor: '#2E7D32',
                  borderRadius: 12,
                  borderSkipped: false,
                  barThickness: 14,
                  order: 2
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                  labels: {
                    boxWidth: 10,
                    usePointStyle: true,
                    font: { family: 'Poppins', size: 11, weight: '600' }
                  }
                },
                tooltip: {
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  titleColor: '#1C1C1C',
                  bodyColor: '#2E7D32',
                  bodyFont: { family: 'Poppins', weight: 'bold' },
                  borderColor: 'rgba(46, 125, 50, 0.3)',
                  borderWidth: 1,
                  padding: 10
                }
              },
              scales: {
                y: {
                  grid: { color: 'rgba(220, 226, 235, 0.5)' },
                  ticks: { font: { family: 'Poppins', size: 10 } },
                  beginAtZero: true,
                  max: 200
                },
                x: {
                  grid: { display: false },
                  ticks: { font: { family: 'Poppins', size: 10, weight: '600' } }
                }
              }
            }
          });
        }
      });

    // 2. Carrega dados dos dois Gráficos Doughnut (Rosca) da API
    this.http.get<any>(`${this.apiUrl}/charts/doughnuts?city=${encodeURIComponent(city)}`)
      .pipe(
        catchError(() => {
          // Fallback seguro de dados vazios para as roscas
          return of({
            doughnut1: [0, 0, 100],
            doughnut2: [0, 0, 0, 100]
          });
        })
      )
      .subscribe(res => {
        // Doughnut 1: Cobertura de Pontos
        const d1Canvas = document.getElementById('doughnutChart1') as HTMLCanvasElement;
        if (d1Canvas) {
          if (this.doughnut1Instance) this.doughnut1Instance.destroy();

          this.doughnut1Instance = new Chart(d1Canvas, {
            type: 'doughnut',
            data: {
              labels: ['Monitorado', 'Em Análise', 'Futuro'],
              datasets: [{
                data: res.doughnut1 || [0, 0, 100],
                backgroundColor: ['#2E7D32', '#A5D6A7', '#E0E0E0'],
                borderWidth: 0,
                hoverOffset: 4
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: '72%',
              plugins: { legend: { display: false } }
            }
          });
        }

        // Doughnut 2: Distribuição de Risco
        const d2Canvas = document.getElementById('doughnutChart2') as HTMLCanvasElement;
        if (d2Canvas) {
          if (this.doughnut2Instance) this.doughnut2Instance.destroy();

          this.doughnut2Instance = new Chart(d2Canvas, {
            type: 'doughnut',
            data: {
              labels: ['Qualidade do Ar', 'Temperatura', 'Umidade', 'Outros'],
              datasets: [{
                data: res.doughnut2 || [0, 0, 0, 100],
                backgroundColor: ['#2E7D32', '#4CAF50', '#81C784', '#C8E6C9'],
                borderWidth: 0,
                hoverOffset: 4
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: '72%',
              plugins: { legend: { display: false } }
            }
          });
        }
      });
  }
}
