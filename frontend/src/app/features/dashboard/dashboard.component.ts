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
    </div>

    <!-- DASHBOARD REAL (Carregado com Sucesso) -->
    <div *ngIf="!isLoading" class="dashboard-grid-layout">

      <div class="dashboard-center-column">

        <!-- Hero Card Gemma AI -->
        <div class="hero-gemma-card glass-panel">
          <div class="gemma-avatar-box">
            <div class="gemma-avatar">
              <img src="/icon.svg" alt="EcoWatch Logo" style="width: 100%; height: 100%; object-fit: contain;">
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

        <!-- Evolução dos Indicadores (Gráfico de Barras + Curva Suave) -->
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

      </div>

    </div>
  `,
  styles: [`
    /* Layout em Coluna Única (Totalmente Expandido) */
    .dashboard-grid-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      align-items: start;
      width: 100%;
    }

    /* Coluna Central */
    .dashboard-center-column {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      min-width: 0;
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
      display: flex;
      align-items: center;
      justify-content: center;
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
    .gemma-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 6px; color: #1C1C1C; word-wrap: break-word; overflow-wrap: break-word; }
    .gemma-text { font-size: 0.88rem; color: #666; margin-bottom: 16px; line-height: 1.5; word-wrap: break-word; overflow-wrap: break-word; }
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

    /* ===== Media Queries Responsivos ===== */
    @media (max-width: 992px) {
      .metrics-grid-9 {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .metrics-grid-9 {
        grid-template-columns: 1fr;
      }
      .metric-card {
        padding: 16px;
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
    }
  `]
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  envService = inject(EnvironmentService);
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/v1';

  isLoading = true;
  private mainChartInstance: any;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.isLoading = false;
      
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
  }

  private initCharts(): void {
    if (typeof Chart === 'undefined') return;

    const city = this.envService.selectedCity();

    // Carrega dados do Gráfico Histórico da API
    this.http.get<any>(`${this.apiUrl}/charts/historical?city=${encodeURIComponent(city)}`)
      .pipe(
        catchError(() => {
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
  }
}
