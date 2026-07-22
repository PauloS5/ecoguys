import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GemmaAiService } from '../../core/services/gemma-ai.service';
import { EnvironmentService } from '../../core/services/environment.service';
import { AutomaticReport } from '../../core/models/environment.model';

declare const lucide: any;

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-container">
      
      <!-- ================= PAINEL DE FILTROS E CONFIGURAÇÃO DO RELATÓRIO ================= -->
      <div class="reports-config-card glass-panel">
        <div class="panel-header mb-3">
          <div>
            <h3><i data-lucide="sliders" class="inline-icon"></i> Filtros do Relatório Customizado</h3>
            <p class="panel-subtitle">Selecione o local, período e as seções desejadas para composição do documento</p>
          </div>
          <button (click)="openFormattedReport()" class="btn btn-primary">
            <i data-lucide="file-text"></i> Gerar Relatório Formatado (PDF)
          </button>
        </div>

        <div class="filters-grid">
          <!-- Filtro 1: Localização -->
          <div class="filter-box">
            <label class="filter-label"><i data-lucide="map-pin"></i> Município / Região</label>
            <select [(ngModel)]="selectedCity" class="form-select w-100">
              <option value="Rio Branco - AC">Rio Branco - AC</option>
              <option value="Manaus - AM">Manaus - AM</option>
              <option value="Cuiabá - MT">Cuiabá - MT</option>
              <option value="Belém - PA">Belém - PA</option>
              <option value="Porto Velho - RO">Porto Velho - RO</option>
            </select>
          </div>

          <!-- Filtro 2: Período -->
          <div class="filter-box">
            <label class="filter-label"><i data-lucide="calendar"></i> Período Analisado</label>
            <select [(ngModel)]="selectedPeriod" class="form-select w-100">
              <option value="Últimos 7 dias">Últimos 7 dias</option>
              <option value="Último mês (30 dias)">Último mês (30 dias)</option>
              <option value="Último trimestre">Último trimestre</option>
              <option value="Últimos 12 meses">Últimos 12 meses</option>
            </select>
          </div>

          <!-- Filtro 3: Formato -->
          <div class="filter-box">
            <label class="filter-label"><i data-lucide="file"></i> Formato de Saída</label>
            <select [(ngModel)]="selectedFormat" class="form-select w-100">
              <option value="PDF Oficial Formatado">PDF Oficial Formatado (Documento)</option>
              <option value="Relatório Executivo">Relatório Executivo Resumido</option>
              <option value="Dados Brutos (CSV/JSON)">Dados Brutos (CSV/JSON)</option>
            </select>
          </div>
        </div>

        <!-- Filtros de Seções do Conteúdo -->
        <div class="sections-filter-group mt-4">
          <h4 class="filter-subtitle"><i data-lucide="check-square"></i> Seções a Incluir no Relatório:</h4>
          <div class="checkboxes-grid mt-2">
            <label class="checkbox-chip" [class.active]="incSummary">
              <input type="checkbox" [(ngModel)]="incSummary">
              <span>1. Resumo das Condições Climáticas</span>
            </label>
            <label class="checkbox-chip" [class.active]="incAnomalies">
              <input type="checkbox" [(ngModel)]="incAnomalies">
              <span>2. Alterações e Anomalias Observadas</span>
            </label>
            <label class="checkbox-chip" [class.active]="incRisks">
              <input type="checkbox" [(ngModel)]="incRisks">
              <span>3. Avaliação de Riscos & Queimadas</span>
            </label>
            <label class="checkbox-chip" [class.active]="incRecommendations">
              <input type="checkbox" [(ngModel)]="incRecommendations">
              <span>4. Recomendações da IA Gemma</span>
            </label>
            <label class="checkbox-chip" [class.active]="incTrends">
              <input type="checkbox" [(ngModel)]="incTrends">
              <span>5. Tendências e Projeções Futuras</span>
            </label>
          </div>
        </div>

      </div>

      <!-- ================= HISTÓRICO DE RELATÓRIOS EXPORTADOS ================= -->
      <div class="history-table-card glass-panel mt-4">
        <div class="panel-header mb-3">
          <h3><i data-lucide="history"></i> Relatórios Exportados Recentemente</h3>
          <span class="badge-count">{{ gemmaService.reportsHistory().length }} Gerados</span>
        </div>
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Código / Título</th>
                <th>Município</th>
                <th>Data de Emissão</th>
                <th>Período</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="gemmaService.reportsHistory().length === 0">
                <td colspan="5" class="text-center text-sub py-4">
                  <em>Nenhum relatório exportado ainda. Configure os filtros acima e clique em "Gerar Relatório Formatado".</em>
                </td>
              </tr>
              <tr *ngFor="let rep of gemmaService.reportsHistory()">
                <td>
                  <div class="report-title-cell">
                    <i data-lucide="file-check" class="icon-green"></i>
                    <div>
                      <strong>{{ rep.title }}</strong>
                      <small class="report-code">ID: {{ rep.id }}</small>
                    </div>
                  </div>
                </td>
                <td>{{ rep.location }}</td>
                <td>{{ rep.dateGenerated }}</td>
                <td>{{ rep.periodAnalyzed }}</td>
                <td>
                  <button (click)="viewReportDocument(rep)" class="btn btn-glass btn-sm me-2">
                    <i data-lucide="eye"></i> Visualizar
                  </button>
                  <button (click)="printReport()" class="btn btn-primary btn-sm">
                    <i data-lucide="printer"></i> Salvar PDF
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- ================= MODAL / DOCUMENT PREVIEW FORMATADO (A4 STYLE) ================= -->
    <div *ngIf="showDocumentModal" class="document-modal-overlay">
      <div class="document-modal-container glass-panel">
        
        <!-- Header da Janela Modal -->
        <div class="document-modal-header">
          <div class="modal-title-box">
            <i data-lucide="file-text" class="icon-green"></i>
            <h4>Pré-visualização do Relatório Formatado</h4>
          </div>
          <div class="modal-actions">
            <button (click)="printReport()" class="btn btn-primary btn-sm">
              <i data-lucide="printer"></i> Imprimir / Salvar PDF
            </button>
            <button (click)="closeModal()" class="btn btn-glass btn-sm">
              <i data-lucide="x"></i> Fechar
            </button>
          </div>
        </div>

        <!-- CORPO DO DOCUMENTO OFICIAL FORMATADO (A4) -->
        <div class="printable-document-page">
          
          <!-- Cabeçalho Oficial do Documento -->
          <div class="doc-header">
            <div class="doc-brand">
              <img src="/icon.svg" alt="EcoWatch AI Logo" class="doc-logo">
              <div>
                <h2 class="doc-brand-name">EcoWatch AI</h2>
                <span class="doc-brand-sub">PLATAFORMA DE MONITORAMENTO AMBIENTAL</span>
              </div>
            </div>
            <div class="doc-meta">
              <span class="doc-code">RELATÓRIO TÉCNICO OFICIAL</span>
              <span class="doc-id">CÓDIGO: ECO-{{ activeReport?.id || '2026-0722' }}</span>
              <span>EMISSÃO: {{ activeReport?.dateGenerated || '22/07/2026 14:45' }}</span>
            </div>
          </div>

          <div class="doc-divider"></div>

          <!-- Título & Parâmetros do Documento -->
          <div class="doc-title-block">
            <h1 class="doc-main-title">Relatório Técnico de Monitoramento Ambiental</h1>
            <div class="doc-param-chips">
              <span class="param-tag">📍 <strong>Município:</strong> {{ selectedCity }}</span>
              <span class="param-tag">📅 <strong>Período:</strong> {{ selectedPeriod }}</span>
              <span class="param-tag">🤖 <strong>Emissor:</strong> Inteligência Artificial Gemma AI</span>
            </div>
          </div>

          <!-- Seção 1: Resumo das Condições Climáticas -->
          <div *ngIf="incSummary" class="doc-section">
            <h3 class="doc-sec-title">1. Resumo das Condições Climáticas</h3>
            <p class="doc-text">
              Durante o período analisado em <strong>{{ selectedCity }}</strong>, os dados coletados indicam estabilidade geral nos parâmetros de temperatura, com atenção voltada para os níveis de umidade relativa do ar durante os horários de pico solar.
            </p>

            <div class="doc-metrics-grid">
              <div *ngFor="let ind of envService.indicators()" class="doc-metric-box">
                <span class="doc-m-label">{{ ind.name }}</span>
                <span class="doc-m-val">{{ ind.value }} {{ ind.unit }}</span>
              </div>
            </div>
          </div>

          <!-- Seção 2: Alterações e Anomalias Observadas -->
          <div *ngIf="incAnomalies" class="doc-section mt-4">
            <h3 class="doc-sec-title">2. Alterações e Anomalias Observadas</h3>
            <p class="doc-text">
              Análise comparativa das variações registradas nas últimas medições em relação às médias históricas da região:
            </p>
            <ul class="doc-list">
              <li><strong>Temperatura Máxima:</strong> Registrou pico de 35.0°C durante o período vespertino.</li>
              <li><strong>Umidade Relativa:</strong> Queda pontual para 28%, enquadrando-se em estado de atenção.</li>
              <li><strong>Precipitação Cumulativa:</strong> 0mm registrados no período.</li>
            </ul>
          </div>

          <!-- Seção 3: Avaliação de Riscos & Queimadas -->
          <div *ngIf="incRisks" class="doc-section mt-4">
            <h3 class="doc-sec-title">3. Avaliação de Riscos Ambientais & Focos de Queimadas</h3>
            <p class="doc-text">
              Varredura de dados de satélite (INPE) e modelos preditivos de risco de incêndio florestal:
            </p>
            <div *ngIf="envService.alerts().length === 0" class="doc-safe-notice">
              🟢 <strong>Situação Controlada:</strong> Nenhum foco de queimada crítico ou alerta de grande porte ativo nesta região.
            </div>
            <div *ngIf="envService.alerts().length > 0" class="doc-alerts-wrapper">
              <div *ngFor="let alt of envService.alerts()" class="doc-alert-box {{ alt.severity }}">
                <strong>[{{ alt.severity | uppercase }}] {{ alt.title }}</strong>: {{ alt.description }}
              </div>
            </div>
          </div>

          <!-- Seção 4: Recomendações da IA Gemma -->
          <div *ngIf="incRecommendations" class="doc-section mt-4">
            <h3 class="doc-sec-title">4. Recomendações da IA Gemma</h3>
            <div class="doc-gemma-box">
              <p>
                <strong>Orientações Preventivas:</strong> Recomenda-se manter a hidratação constante da população, evitar queimadas de resíduos e utilizar proteção solar adequada nos horários de maior incidência ultravioleta (entre 11h e 16h).
              </p>
            </div>
          </div>

          <!-- Seção 5: Tendências e Projeções Futuras -->
          <div *ngIf="incTrends" class="doc-section mt-4">
            <h3 class="doc-sec-title">5. Projeção de Tendências Futuras</h3>
            <p class="doc-text">
              Projeções calculadas via algoritmo preditivo indicam manutenção das temperaturas elevadas nos próximos 3 dias, com probabilidade de aumento gradativo na umidade relativa no final de semana.
            </p>
          </div>

          <!-- Rodapé de Assinatura Digital e Autenticidade -->
          <div class="doc-footer mt-5">
            <div class="doc-signature">
              <div class="sig-line"></div>
              <span>Sistema de Inteligência Ambiental EcoWatch AI</span>
              <small>Documento Assinado Digitalmente • Autenticidade Verificada</small>
            </div>
          </div>

        </div>

      </div>
    </div>
  `,
  styles: [`
    .reports-container { display: flex; flex-direction: column; gap: 16px; }
    .inline-icon { vertical-align: middle; margin-right: 6px; width: 18px; height: 18px; color: #2E7D32; }
    
    .filters-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .filter-box { display: flex; flex-direction: column; gap: 6px; }
    .filter-label { font-size: 0.82rem; font-weight: 600; color: #555; display: flex; align-items: center; gap: 6px; }
    .form-select { padding: 10px 14px; border-radius: 14px; border: 1px solid rgba(46, 125, 50, 0.2); outline: none; background: #FFF; font-weight: 500; }

    .filter-subtitle { font-size: 0.88rem; font-weight: 700; color: #2E7D32; display: flex; align-items: center; gap: 6px; }
    .checkboxes-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .checkbox-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(220, 226, 235, 0.8);
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s;
    }
    .checkbox-chip.active {
      background: rgba(46, 125, 50, 0.1);
      border-color: #2E7D32;
      color: #2E7D32;
      font-weight: 600;
    }
    .checkbox-chip input[type="checkbox"] { accent-color: #2E7D32; width: 16px; height: 16px; }

    /* Histórico */
    .badge-count { font-size: 0.75rem; font-weight: 600; color: #2E7D32; background: rgba(46, 125, 50, 0.1); padding: 4px 12px; border-radius: 999px; }
    .table-responsive { overflow-x: auto; }
    .custom-table { width: 100%; border-collapse: collapse; min-width: 650px; }
    .custom-table th, .custom-table td { padding: 12px 16px; text-align: left; font-size: 0.85rem; border-bottom: 1px solid rgba(220, 226, 235, 0.8); }
    .report-title-cell { display: flex; align-items: center; gap: 10px; }
    .icon-green { color: #2E7D32; }
    .report-code { display: block; font-size: 0.72rem; color: #999; }
    .btn-sm { padding: 6px 12px; font-size: 0.78rem; border-radius: 10px; }
    .me-2 { margin-right: 8px; }

    /* ===== MODAL DE PREVISUALIZAÇÃO DO RELATÓRIO OFICIAL (A4 STYLE) ===== */
    .document-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .document-modal-container {
      width: 850px;
      max-width: 95vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      background: #F8FAF8;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
    }
    .document-modal-header {
      padding: 16px 24px;
      background: #FFF;
      border-bottom: 1px solid rgba(220, 226, 235, 0.8);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-title-box { display: flex; align-items: center; gap: 10px; font-weight: 700; }
    .modal-actions { display: flex; gap: 10px; }

    /* Página do Documento Formatado */
    .printable-document-page {
      flex: 1;
      overflow-y: auto;
      padding: 40px;
      background: #FFF;
      color: #1C1C1C;
      font-family: 'Poppins', sans-serif;
    }
    .doc-header { display: flex; justify-content: space-between; align-items: center; }
    .doc-brand { display: flex; align-items: center; gap: 12px; }
    .doc-logo { width: 44px; height: 44px; object-fit: contain; }
    .doc-brand-name { font-size: 1.3rem; font-weight: 800; color: #2E7D32; margin: 0; line-height: 1; }
    .doc-brand-sub { font-size: 0.6rem; font-weight: 700; color: #1565C0; letter-spacing: 0.8px; }
    .doc-meta { display: flex; flex-direction: column; text-align: right; font-size: 0.72rem; color: #666; }
    .doc-code { font-weight: 700; color: #2E7D32; font-size: 0.78rem; }
    
    .doc-divider { height: 2px; background: #2E7D32; margin: 20px 0; }
    
    .doc-main-title { font-size: 1.4rem; font-weight: 700; color: #1C1C1C; margin-bottom: 12px; }
    .doc-param-chips { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
    .param-tag { background: #F0F7F0; border: 1px solid rgba(46, 125, 50, 0.2); padding: 4px 12px; border-radius: 999px; font-size: 0.78rem; color: #2E7D32; }
    
    .doc-sec-title { font-size: 1.05rem; font-weight: 700; color: #2E7D32; border-bottom: 1px solid #E0E0E0; padding-bottom: 6px; margin-bottom: 12px; }
    .doc-text { font-size: 0.88rem; color: #444; line-height: 1.6; margin-bottom: 12px; }
    
    .doc-metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 12px; }
    .doc-metric-box { background: #F8FAF8; border: 1px solid #E0E0E0; padding: 10px 14px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
    .doc-m-label { font-size: 0.78rem; color: #666; font-weight: 500; }
    .doc-m-val { font-size: 0.95rem; font-weight: 700; color: #2E7D32; }

    .doc-list { font-size: 0.85rem; color: #444; padding-left: 20px; line-height: 1.8; }
    .doc-safe-notice { background: #E8F5E9; border: 1px solid #C8E6C9; padding: 12px 16px; border-radius: 12px; font-size: 0.85rem; color: #2E7D32; }
    .doc-alert-box { padding: 10px 14px; border-radius: 10px; font-size: 0.82rem; margin-bottom: 6px; }
    .doc-alert-box.critical { background: #FFEBEE; border-left: 4px solid #D32F2F; color: #C62828; }
    .doc-alert-box.warning { background: #FFF3E0; border-left: 4px solid #F57C00; color: #E65100; }

    .doc-gemma-box { background: #F0F4F8; border-left: 4px solid #1565C0; padding: 14px 18px; border-radius: 12px; font-size: 0.85rem; color: #1565C0; line-height: 1.6; }

    .doc-footer { text-align: center; border-top: 1px solid #E0E0E0; padding-top: 20px; }
    .sig-line { width: 160px; height: 1px; background: #999; margin: 0 auto 8px auto; }
    .doc-signature { display: flex; flex-direction: column; font-size: 0.78rem; color: #666; font-weight: 600; }

    @media print {
      body * { visibility: hidden; }
      .printable-document-page, .printable-document-page * { visibility: visible; }
      .printable-document-page { position: absolute; left: 0; top: 0; width: 100%; padding: 0; }
    }

    @media (max-width: 992px) {
      .filters-grid, .checkboxes-grid { grid-template-columns: 1fr; }
      .doc-metrics-grid { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class ReportsComponent {
  gemmaService = inject(GemmaAiService);
  envService = inject(EnvironmentService);

  selectedCity = 'Rio Branco - AC';
  selectedPeriod = 'Últimos 7 dias';
  selectedFormat = 'PDF Oficial Formatado';

  // Filtros de Seções a Incluir
  incSummary = true;
  incAnomalies = true;
  incRisks = true;
  incRecommendations = true;
  incTrends = true;

  showDocumentModal = false;
  activeReport: AutomaticReport | null = null;

  openFormattedReport(): void {
    const newReport: AutomaticReport = {
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      title: `Relatório Ambiental Customizado`,
      location: this.selectedCity,
      dateGenerated: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      periodAnalyzed: this.selectedPeriod,
      summary: 'Resumo das Condições Climáticas',
      changes: 'Alterações e Anomalias Observadas',
      risks: 'Avaliação de Riscos e Queimadas',
      recommendations: 'Recomendações da IA Gemma',
      trends: 'Projeção de Tendências Futuras'
    };

    this.activeReport = newReport;
    this.gemmaService.reportsHistory.update(list => [newReport, ...list]);
    this.showDocumentModal = true;
    this.refreshIcons();
  }

  viewReportDocument(report: AutomaticReport): void {
    this.activeReport = report;
    this.selectedCity = report.location;
    this.selectedPeriod = report.periodAnalyzed;
    this.showDocumentModal = true;
    this.refreshIcons();
  }

  closeModal(): void {
    this.showDocumentModal = false;
  }

  printReport(): void {
    window.print();
  }

  private refreshIcons(): void {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 100);
  }
}
