import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alerts-layout">
      
      <div class="alerts-main-list glass-panel">
        <div class="panel-header mb-3">
          <div>
            <h3>Alertas Ambientais</h3>
            <p class="panel-subtitle">Notificações emitidas quando limites forem ultrapassados</p>
          </div>
        </div>

        <div class="alert-triggers-info">
          <h4>Tipos de Alerta Monitorados:</h4>
          <div class="triggers-chips">
            <span class="trigger-chip"><i data-lucide="thermometer"></i> Temperatura Elevada</span>
            <span class="trigger-chip"><i data-lucide="droplets"></i> Baixa Umidade</span>
            <span class="trigger-chip"><i data-lucide="wind"></i> Qualidade do Ar</span>
            <span class="trigger-chip"><i data-lucide="flame"></i> Risco de Queimadas</span>
            <span class="trigger-chip"><i data-lucide="cloud-rain"></i> Chuvas Intensas</span>
          </div>
        </div>

        <div class="empty-state-box">
          <p class="text-sub">Nenhum alerta ativo no momento.</p>
        </div>
      </div>

      <div class="alerts-settings-panel glass-panel">
        <div class="panel-header mb-3">
          <h3><i data-lucide="sliders"></i> Configurar Limites</h3>
        </div>
        <div class="settings-form">
          <div class="setting-item mb-3">
            <label>Temperatura máxima (°C)</label>
            <input type="number" class="form-input" placeholder="Ex: 35">
          </div>
          <div class="setting-item mb-3">
            <label>Umidade mínima (%)</label>
            <input type="number" class="form-input" placeholder="Ex: 30">
          </div>
          <div class="setting-item mb-3">
            <label>Índice AQI máximo</label>
            <input type="number" class="form-input" placeholder="Ex: 100">
          </div>
          <button class="btn btn-primary w-100">
            <i data-lucide="save"></i> Salvar
          </button>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .alerts-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
    .alert-triggers-info { background: rgba(255, 255, 255, 0.6); padding: 16px; border-radius: 16px; margin-bottom: 16px; border: 1px solid rgba(220, 226, 235, 0.8); }
    .alert-triggers-info h4 { font-size: 0.82rem; color: #666; margin-bottom: 10px; }
    .triggers-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .trigger-chip { font-size: 0.78rem; background: #FFF; border: 1px solid rgba(220, 226, 235, 0.8); padding: 6px 12px; border-radius: 999px; }
    .empty-state-box { height: 200px; display: flex; align-items: center; justify-content: center; }
    .form-input { width: 100%; padding: 10px; border-radius: 12px; border: 1px solid rgba(220, 226, 235, 0.8); margin-top: 6px; }
  `]
})
export class AlertsComponent {}
