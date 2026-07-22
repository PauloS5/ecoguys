import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MapService } from '../../core/services/map.service';
import { EnvironmentService } from '../../core/services/environment.service';

declare const L: any;
declare const lucide: any;

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="map-view-container">

      <!-- Breadcrumb + Filtros -->
      <div class="map-breadcrumb glass-panel">
        <div class="breadcrumb-nav">
          <button (click)="navigateToCountry()" class="breadcrumb-item" [class.active]="mapService.navigationState().level === 'country'">
            <i data-lucide="globe"></i>
            <span>Brasil</span>
          </button>

          <ng-container *ngIf="mapService.navigationState().stateName">
            <span class="breadcrumb-sep"><i data-lucide="chevron-right"></i></span>
            <button (click)="navigateToState(mapService.navigationState().stateCode!)"
                    class="breadcrumb-item"
                    [class.active]="mapService.navigationState().level === 'state'">
              {{ mapService.navigationState().stateName }}
            </button>
          </ng-container>

          <ng-container *ngIf="mapService.navigationState().municipalityName">
            <span class="breadcrumb-sep"><i data-lucide="chevron-right"></i></span>
            <span class="breadcrumb-item active">{{ mapService.navigationState().municipalityName }}</span>
          </ng-container>
        </div>

        <div class="map-filters">
          <label class="filter-chip" *ngFor="let layer of mapLayers">
            <input type="checkbox" [checked]="layer.active" (change)="toggleLayer(layer)">
            <span>{{ layer.label }}</span>
          </label>
        </div>
      </div>

      <!-- Mapa + Painel Lateral -->
      <div class="map-body">
        <div class="map-frame glass-panel" [class.with-panel]="showPanel">
          <div #mapElement class="leaflet-map"></div>

          <!-- Loading -->
          <div *ngIf="mapService.isLoading()" class="map-loading">
            <div class="spinner"></div>
            <span>Carregando dados geográficos...</span>
          </div>

          <!-- Botão Voltar flutuante -->
          <button *ngIf="mapService.navigationState().level !== 'country'"
                  (click)="navigateBack()"
                  class="map-back-btn">
            <i data-lucide="arrow-left"></i>
            <span>Voltar</span>
          </button>
        </div>

        <!-- Painel Lateral do Município -->
        <div class="side-panel glass-panel" *ngIf="showPanel" [@panelSlide]>
          <div class="panel-top">
            <button (click)="closePanel()" class="panel-close-btn">
              <i data-lucide="x"></i>
            </button>
          </div>

          <div class="panel-header">
            <div class="panel-icon">
              <i data-lucide="map-pin"></i>
            </div>
            <div>
              <h3 class="panel-title">{{ selectedMunicipalityName }}</h3>
              <span class="text-sub small">{{ mapService.navigationState().stateName }}</span>
            </div>
          </div>

          <div class="panel-divider"></div>

          <div class="panel-section">
            <h4 class="panel-section-title">
              <i data-lucide="activity"></i> Indicadores Ambientais
            </h4>
            <div class="panel-indicators">
              <div *ngFor="let ind of envService.indicators()" class="indicator-row">
                <span class="ind-name">{{ ind.name }}</span>
                <span class="ind-value" [class]="ind.status">{{ ind.value }} {{ ind.unit }}</span>
              </div>
            </div>
          </div>

          <div class="panel-divider"></div>

          <div class="panel-section">
            <h4 class="panel-section-title">
              <i data-lucide="bell"></i> Alertas Ativos
            </h4>
            <div *ngIf="envService.alerts().length === 0" class="panel-empty">
              <i data-lucide="check-circle"></i>
              <span>Nenhum alerta ativo</span>
            </div>
            <div *ngFor="let alert of envService.alerts()" class="alert-item" [class]="alert.severity">
              <span class="alert-title">{{ alert.title }}</span>
              <span class="alert-desc">{{ alert.description }}</span>
            </div>
          </div>

          <a routerLink="/assistente" class="btn btn-primary panel-cta">
            <i data-lucide="message-square"></i> Perguntar ao Assistente
          </a>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* ===== Layout ===== */
    .map-view-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      height: calc(100vh - 110px);
    }

    /* ===== Breadcrumb ===== */
    .map-breadcrumb {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 20px;
      flex-shrink: 0;
    }
    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .breadcrumb-item {
      background: none;
      border: none;
      font-family: inherit;
      font-size: 0.85rem;
      font-weight: 500;
      color: #888;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border-radius: 10px;
      transition: all 0.25s;
    }
    .breadcrumb-item:hover {
      background: rgba(46, 125, 50, 0.08);
      color: #2E7D32;
    }
    .breadcrumb-item.active {
      color: #2E7D32;
      font-weight: 700;
      cursor: default;
    }
    .breadcrumb-sep {
      color: #ccc;
      display: flex;
      align-items: center;
      font-size: 0.75rem;
    }
    .map-filters {
      display: flex;
      gap: 8px;
    }
    .filter-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #FFF;
      padding: 6px 14px;
      border-radius: 999px;
      border: 1px solid rgba(220, 226, 235, 0.8);
      font-size: 0.78rem;
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;
    }
    .filter-chip:hover {
      border-color: #2E7D32;
      background: rgba(46, 125, 50, 0.04);
    }
    .filter-chip input[type="checkbox"] {
      accent-color: #2E7D32;
      width: 14px;
      height: 14px;
    }

    /* ===== Map Body ===== */
    .map-body {
      flex: 1;
      display: flex;
      gap: 12px;
      min-height: 0;
    }
    .map-frame {
      flex: 1;
      position: relative;
      overflow: hidden;
      padding: 0;
      border-radius: 24px;
    }
    .map-frame.with-panel {
      flex: 2;
    }
    .leaflet-map {
      width: 100%;
      height: 100%;
      border-radius: 24px;
      z-index: 1;
    }

    /* ===== Loading ===== */
    .map-loading {
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(6px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      z-index: 500;
      border-radius: 24px;
      font-size: 0.88rem;
      color: #666;
      font-weight: 500;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(46, 125, 50, 0.15);
      border-top-color: #2E7D32;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ===== Botão Voltar ===== */
    .map-back-btn {
      position: absolute;
      top: 16px;
      left: 16px;
      z-index: 450;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(220, 226, 235, 0.8);
      border-radius: 14px;
      padding: 10px 18px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: inherit;
      font-size: 0.85rem;
      font-weight: 600;
      color: #2E7D32;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      transition: all 0.25s;
    }
    .map-back-btn:hover {
      background: #FFF;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
      transform: translateY(-1px);
    }

    /* ===== Side Panel ===== */
    .side-panel {
      width: 360px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex-shrink: 0;
      animation: slideIn 0.35s ease-out;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .panel-top {
      display: flex;
      justify-content: flex-end;
    }
    .panel-close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px;
      border-radius: 10px;
      color: #999;
      transition: all 0.2s;
    }
    .panel-close-btn:hover {
      background: rgba(0, 0, 0, 0.06);
      color: #333;
    }
    .panel-header {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .panel-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #2E7D32, #4CAF50);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFF;
      flex-shrink: 0;
    }
    .panel-title {
      font-size: 1.1rem;
      font-weight: 700;
    }
    .panel-divider {
      height: 1px;
      background: rgba(220, 226, 235, 0.8);
    }
    .panel-section-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .panel-indicators {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .indicator-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 4px;
      border-radius: 8px;
      font-size: 0.85rem;
      transition: background 0.2s;
    }
    .indicator-row:hover {
      background: rgba(0, 0, 0, 0.02);
    }
    .ind-name {
      color: #666;
    }
    .ind-value {
      font-weight: 600;
      color: #333;
    }
    .ind-value.warning { color: #F57C00; }
    .ind-value.critical { color: #D32F2F; }
    .ind-value.normal { color: #388E3C; }
    .panel-empty {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.82rem;
      color: #388E3C;
      background: rgba(56, 142, 60, 0.06);
      padding: 12px 16px;
      border-radius: 12px;
    }
    .alert-item {
      padding: 10px 14px;
      border-radius: 12px;
      margin-bottom: 6px;
    }
    .alert-item.critical {
      background: rgba(211, 47, 47, 0.08);
      border-left: 3px solid #D32F2F;
    }
    .alert-item.warning {
      background: rgba(245, 124, 0, 0.08);
      border-left: 3px solid #F57C00;
    }
    .alert-title {
      font-size: 0.82rem;
      font-weight: 600;
      display: block;
    }
    .alert-desc {
      font-size: 0.75rem;
      color: #666;
    }
    .panel-cta {
      margin-top: auto;
      text-decoration: none;
      width: 100%;
    }
  `]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapElement') mapElement!: ElementRef;

  mapService = inject(MapService);
  envService = inject(EnvironmentService);
  private ngZone = inject(NgZone);

  private map: any;
  private estadosLayer: any;
  private municipiosLayer: any;
  private currentStateCode: string = '';

  showPanel = false;
  selectedMunicipalityName = '';

  mapLayers = [
    { id: 'indicators', label: 'Indicadores', active: true },
    { id: 'alerts', label: 'Alertas Ativos', active: true },
    { id: 'risk', label: 'Regiões de Risco', active: true }
  ];

  ngAfterViewInit(): void {
    this.initMap();
    this.refreshIcons();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private async initMap(): Promise<void> {
    if (typeof L === 'undefined' || !this.mapElement) return;

    this.map = L.map(this.mapElement.nativeElement, {
      zoomControl: false,
      attributionControl: false
    }).setView([-14.235, -51.925], 4);

    // Tile layer com estilo claro
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap | CARTO | EcoWatch AI',
      subdomains: 'abcd',
      maxZoom: 18
    }).addTo(this.map);

    // Controle de zoom no canto inferior direito
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Attribution discreta
    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(this.map);

    await this.loadEstados();
  }

  private async loadEstados(): Promise<void> {
    try {
      const data = await this.mapService.getEstados();

      this.estadosLayer = L.geoJSON(data, {
        style: () => ({
          color: '#2E7D32',
          weight: 1.8,
          fillColor: '#4CAF50',
          fillOpacity: 0.25,
          dashArray: ''
        }),
        onEachFeature: (feature: any, layer: any) => {
          const code = feature.properties?.codarea || feature.id || '';
          const name = this.mapService.getStateName(code);
          const sigla = this.mapService.getStateSigla(code);

          layer.bindTooltip(
            `<strong>${name}</strong> (${sigla})`,
            { sticky: true, className: 'map-tooltip', direction: 'top', offset: [0, -10] }
          );

          layer.on({
            mouseover: (e: any) => {
              e.target.setStyle({
                fillOpacity: 0.5,
                weight: 2.5,
                color: '#1B5E20'
              });
              e.target.bringToFront();
            },
            mouseout: (e: any) => {
              this.estadosLayer.resetStyle(e.target);
            },
            click: (e: any) => {
              this.ngZone.run(() => {
                this.drillDownToState(code, e.target.getBounds());
              });
            }
          });
        }
      }).addTo(this.map);

      this.refreshIcons();
    } catch (error) {
      console.error('Erro ao carregar estados:', error);
    }
  }

  private async drillDownToState(codUF: string, bounds: any): Promise<void> {
    this.currentStateCode = codUF;
    this.showPanel = false;
    this.mapService.navigateToState(codUF);

    // Zoom suave para o estado
    this.map.fitBounds(bounds, { padding: [30, 30], animate: true, duration: 0.8 });

    // Remove camada de estados
    if (this.estadosLayer) {
      this.map.removeLayer(this.estadosLayer);
    }
    if (this.municipiosLayer) {
      this.map.removeLayer(this.municipiosLayer);
    }

    try {
      const data = await this.mapService.getMunicipios(codUF);

      this.municipiosLayer = L.geoJSON(data, {
        style: () => ({
          color: '#1565C0',
          weight: 0.8,
          fillColor: '#42A5F5',
          fillOpacity: 0.2,
          dashArray: ''
        }),
        onEachFeature: (feature: any, layer: any) => {
          const municipalityCode = feature.properties?.codarea || feature.id || '';
          const municipalityName = feature.properties?.nome || `Município ${municipalityCode}`;

          layer.bindTooltip(
            `<strong>${municipalityName}</strong>`,
            { sticky: true, className: 'map-tooltip', direction: 'top', offset: [0, -10] }
          );

          layer.on({
            mouseover: (e: any) => {
              e.target.setStyle({
                fillOpacity: 0.45,
                weight: 2,
                color: '#0D47A1'
              });
              e.target.bringToFront();
            },
            mouseout: (e: any) => {
              this.municipiosLayer.resetStyle(e.target);
            },
            click: () => {
              this.ngZone.run(() => {
                this.onMunicipioClick(codUF, municipalityCode, municipalityName);
              });
            }
          });
        }
      }).addTo(this.map);

      this.refreshIcons();
    } catch (error) {
      console.error('Erro ao carregar municípios:', error);
    }
  }

  private onMunicipioClick(stateCode: string, municipalityCode: string, name: string): void {
    this.selectedMunicipalityName = name;
    this.showPanel = true;
    this.mapService.navigateToMunicipality(stateCode, municipalityCode, name);
    setTimeout(() => this.refreshIcons(), 50);
  }

  navigateToCountry(): void {
    this.showPanel = false;
    this.mapService.navigateToCountry();

    if (this.municipiosLayer) {
      this.map.removeLayer(this.municipiosLayer);
      this.municipiosLayer = null;
    }

    if (this.estadosLayer) {
      this.estadosLayer.addTo(this.map);
    } else {
      this.loadEstados();
    }

    this.map.flyTo([-14.235, -51.925], 4, { duration: 0.8 });
    setTimeout(() => this.refreshIcons(), 50);
  }

  navigateToState(codUF: string): void {
    if (this.mapService.navigationState().level === 'municipality') {
      this.showPanel = false;
      this.mapService.navigateToState(codUF);
      setTimeout(() => this.refreshIcons(), 50);
    }
  }

  navigateBack(): void {
    const state = this.mapService.navigationState();
    if (state.level === 'municipality') {
      this.navigateToState(state.stateCode!);
    } else if (state.level === 'state') {
      this.navigateToCountry();
    }
  }

  closePanel(): void {
    this.showPanel = false;
    const state = this.mapService.navigationState();
    if (state.stateCode) {
      this.mapService.navigateToState(state.stateCode);
    }
  }

  toggleLayer(layer: any): void {
    layer.active = !layer.active;
  }

  private refreshIcons(): void {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 100);
  }
}
