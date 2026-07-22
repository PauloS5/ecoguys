import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EnvironmentService } from '../../core/services/environment.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container">
      
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
            Selecione um município e atualize os dados para visualizar a análise ambiental gerada pela inteligência artificial.
          </p>
          <div class="gemma-actions">
            <a routerLink="/assistente" class="btn btn-primary">
              <i data-lucide="message-square"></i> Perguntar ao Assistente
            </a>
            <a routerLink="/relatorios" class="btn btn-glass">
              <i data-lucide="file-text"></i> Gerar Relatório
            </a>
          </div>
        </div>
      </div>

      <!-- Indicadores Ambientais -->
      <h3 class="section-title mt-4 mb-3">Indicadores Ambientais — {{ envService.selectedCity() }}</h3>
      
      <div class="metrics-grid-9">
        <div *ngFor="let item of envService.indicators()" class="metric-card glass-card">
          <div class="metric-header">
            <span class="metric-label">{{ item.name }}</span>
            <div class="metric-icon-box {{ item.category }}">
              <i data-lucide="activity"></i>
            </div>
          </div>
          <div class="metric-value-group">
            <span class="metric-value">{{ item.value }} <small>{{ item.unit }}</small></span>
          </div>
        </div>
      </div>

      <!-- Evolução & Recomendações -->
      <div class="dashboard-middle-row mt-4">
        <div class="chart-panel glass-panel">
          <div class="panel-header">
            <div>
              <h3>Evolução dos Indicadores</h3>
              <p class="panel-subtitle">Dados históricos de monitoramento</p>
            </div>
          </div>
          <div class="chart-placeholder">
            <p class="text-sub">Os gráficos serão exibidos quando os dados estiverem disponíveis.</p>
          </div>
        </div>

        <div class="insights-panel glass-panel">
          <div class="panel-header">
            <h3><i data-lucide="lightbulb"></i> Recomendações</h3>
          </div>
          <div class="empty-state">
            <p class="text-sub">As recomendações serão geradas automaticamente pela IA com base nos indicadores.</p>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard-container { display: flex; flex-direction: column; gap: 16px; }
    .hero-gemma-card {
      display: flex; align-items: center; gap: 24px;
      background: linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(240,247,240,0.95) 100%);
      border: 1.5px solid rgba(46, 125, 50, 0.25);
    }
    .gemma-avatar {
      width: 64px; height: 64px; background: linear-gradient(135deg, #2E7D32, #1B5E20);
      border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #FFF;
    }
    .gemma-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 0.72rem; font-weight: 700; color: #2E7D32; background: rgba(46, 125, 50, 0.12); padding: 4px 10px; border-radius: 999px; margin-bottom: 8px; }
    .gemma-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 6px; }
    .gemma-text { font-size: 0.88rem; color: #666; margin-bottom: 16px; }
    .gemma-actions { display: flex; gap: 12px; }
    .section-title { font-size: 1.05rem; font-weight: 700; }
    .metrics-grid-9 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .metric-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .metric-label { font-size: 0.8rem; font-weight: 600; color: #666; text-transform: uppercase; }
    .metric-icon-box { width: 34px; height: 34px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.04); }
    .metric-value { font-size: 1.6rem; font-weight: 700; }
    .dashboard-middle-row { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
    .chart-placeholder, .empty-state { height: 200px; display: flex; align-items: center; justify-content: center; }
  `]
})
export class DashboardComponent {
  envService = inject(EnvironmentService);
}
