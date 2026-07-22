import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="config-container glass-panel">
      <div class="panel-header mb-3">
        <h3><i data-lucide="info"></i> Informações do Sistema</h3>
      </div>
      <div class="config-body">
        <p class="text-sub mb-4">Fontes de dados integradas ao <strong>EcoWatch AI</strong>:</p>
        
        <div class="config-sections-grid">
          <div class="config-card glass-card">
            <h4>Dados Meteorológicos</h4>
            <p class="small text-sub">Temperatura, Umidade, Vento e Chuva</p>
          </div>
          <div class="config-card glass-card">
            <h4>Queimadas e Satélite</h4>
            <p class="small text-sub">Monitoramento de focos de calor via satélite</p>
          </div>
          <div class="config-card glass-card">
            <h4>Cobertura Vegetal</h4>
            <p class="small text-sub">Uso da terra e recortes territoriais</p>
          </div>
          <div class="config-card glass-card">
            <h4>Inteligência Artificial</h4>
            <p class="small text-sub">Interpretação de dados e geração de relatórios</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .config-sections-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 16px; }
    .config-card { padding: 16px; }
    .config-card h4 { font-size: 0.95rem; font-weight: 600; margin-bottom: 4px; }
  `]
})
export class SettingsComponent {}
