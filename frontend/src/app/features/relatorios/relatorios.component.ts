import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reports-container">
      
      <div class="reports-filter-bar glass-panel">
        <div class="filter-group">
          <label>Município:</label>
          <select class="form-select">
            <option>Rio Branco - AC</option>
            <option>Manaus - AM</option>
            <option>Cuiabá - MT</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Período:</label>
          <select class="form-select">
            <option>Últimos 7 dias</option>
            <option>Último mês</option>
            <option>Últimos 12 meses</option>
          </select>
        </div>
        <button class="btn btn-primary">
          <i data-lucide="sparkles"></i> Gerar Relatório (PDF)
        </button>
      </div>

      <!-- Estrutura do Relatório -->
      <div class="report-sections-preview glass-panel mt-4">
        <h3><i data-lucide="file-text"></i> Conteúdo do Relatório</h3>
        <p class="text-sub small">O relatório gerado pela IA irá conter as seguintes seções:</p>
        
        <div class="report-structure-grid mt-3">
          <div class="struct-card glass-card">
            <span class="struct-num">1</span>
            <h4>Resumo das Condições</h4>
            <p class="text-sub small">Síntese dos dados ambientais coletados.</p>
          </div>
          <div class="struct-card glass-card">
            <span class="struct-num">2</span>
            <h4>Alterações Observadas</h4>
            <p class="text-sub small">Principais mudanças e anomalias no período.</p>
          </div>
          <div class="struct-card glass-card">
            <span class="struct-num">3</span>
            <h4>Possíveis Riscos</h4>
            <p class="text-sub small">Riscos ambientais identificados na região.</p>
          </div>
          <div class="struct-card glass-card">
            <span class="struct-num">4</span>
            <h4>Recomendações</h4>
            <p class="text-sub small">Orientações preventivas para a população.</p>
          </div>
          <div class="struct-card glass-card">
            <span class="struct-num">5</span>
            <h4>Tendências</h4>
            <p class="text-sub small">Evolução esperada dos indicadores.</p>
          </div>
        </div>
      </div>

      <!-- Histórico -->
      <div class="history-table-card glass-panel mt-4">
        <div class="panel-header mb-3">
          <h3><i data-lucide="file-check"></i> Relatórios Exportados</h3>
        </div>
        <table class="custom-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Data</th>
              <th>Período</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="4" class="text-center text-sub py-3">
                <em>Nenhum relatório exportado ainda.</em>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  `,
  styles: [`
    .reports-container { display: flex; flex-direction: column; gap: 16px; }
    .reports-filter-bar { display: flex; align-items: center; justify-content: space-between; }
    .filter-group { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; }
    .form-select { padding: 8px 12px; border-radius: 12px; border: 1px solid rgba(220, 226, 235, 0.8); }
    .report-structure-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
    .struct-card { position: relative; padding: 16px; }
    .struct-num { position: absolute; top: 10px; right: 12px; font-size: 1.4rem; font-weight: 700; color: #2E7D32; opacity: 0.25; }
    .struct-card h4 { font-size: 0.88rem; font-weight: 600; margin-bottom: 4px; }
    .custom-table { width: 100%; border-collapse: collapse; }
    .custom-table th, .custom-table td { padding: 12px; text-align: left; font-size: 0.85rem; border-bottom: 1px solid rgba(220, 226, 235, 0.8); }
  `]
})
export class ReportsComponent {}
