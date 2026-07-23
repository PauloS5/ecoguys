import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
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

      <!-- Top Bar: Breadcrumb + Seletor de Camadas & Estilos -->
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

        <!-- Seletor de Estilo do Mapa + Filtros -->
        <div class="map-controls-group">
          
          <div class="tile-style-selector">
            <button (click)="changeBasemap('dark')" class="tile-btn" [class.active]="activeBasemap === 'dark'">
              🌑 Dark Neon
            </button>
            <button (click)="changeBasemap('satellite')" class="tile-btn" [class.active]="activeBasemap === 'satellite'">
              🛰️ Satélite
            </button>
            <button (click)="changeBasemap('voyager')" class="tile-btn" [class.active]="activeBasemap === 'voyager'">
              🗺️ Vetorial
            </button>
          </div>

          <div class="map-filters">
            <label class="filter-chip" *ngFor="let layer of mapLayers">
              <input type="checkbox" [checked]="layer.active" (change)="toggleLayer(layer)">
              <span>{{ layer.label }}</span>
            </label>
          </div>

        </div>
      </div>

      <!-- Corpo do Mapa + Painel Lateral -->
      <div class="map-body">
        <div class="map-frame glass-panel" [class.with-panel]="showPanel">
          <div #mapElement class="leaflet-map"></div>

          <!-- Loading -->
          <div *ngIf="mapService.isLoading()" class="map-loading">
            <div class="spinner"></div>
            <span>Carregando malhas do IBGE (v3)...</span>
          </div>

          <!-- Botão Voltar flutuante -->
          <button *ngIf="mapService.navigationState().level !== 'country'"
                  (click)="navigateBack()"
                  class="map-back-btn">
            <i data-lucide="arrow-left"></i>
            <span>Voltar ao Brasil</span>
          </button>
        </div>

        <!-- Painel Lateral de Detalhes -->
        <div class="side-panel glass-panel" *ngIf="showPanel">
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
              <span>Nenhum alerta ativo no município</span>
            </div>
            <div *ngFor="let alert of envService.alerts()" class="alert-item" [class]="alert.severity">
              <span class="alert-title">{{ alert.title }}</span>
              <span class="alert-desc">{{ alert.description }}</span>
            </div>
          </div>

          <a routerLink="/assistente" class="btn btn-primary panel-cta">
            <i data-lucide="message-square"></i> Consultar IA Gemma
          </a>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .map-view-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      height: calc(100vh - 110px);
    }

    .map-breadcrumb {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 20px;
      flex-shrink: 0;
      gap: 12px;
      flex-wrap: wrap;
    }
    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
    }
    .breadcrumb-item {
      background: none;
      border: none;
      font-family: inherit;
      font-size: 0.85rem;
      font-weight: 500;
      color: #777;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 12px;
      transition: all 0.25s;
    }
    .breadcrumb-item:hover {
      background: rgba(46, 125, 50, 0.1);
      color: #2E7D32;
    }
    .breadcrumb-item.active {
      color: #2E7D32;
      font-weight: 700;
      background: rgba(46, 125, 50, 0.08);
    }
    .breadcrumb-sep { color: #ccc; font-size: 0.75rem; }

    .map-controls-group {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
    }

    /* Seletor de Basemap */
    .tile-style-selector {
      display: flex;
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(46, 125, 50, 0.2);
      border-radius: 999px;
      padding: 3px;
      gap: 2px;
    }
    .tile-btn {
      border: none;
      background: transparent;
      padding: 5px 12px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #555;
      cursor: pointer;
      transition: all 0.25s;
    }
    .tile-btn.active {
      background: #2E7D32;
      color: #FFF;
      box-shadow: 0 4px 12px rgba(46, 125, 50, 0.25);
    }

    .map-filters { display: flex; gap: 8px; flex-wrap: wrap; }
    .filter-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #FFF;
      padding: 6px 14px;
      border-radius: 999px;
      border: 1px solid rgba(220, 226, 235, 0.8);
      font-size: 0.78rem;
      font-weight: 500;
      cursor: pointer;
      user-select: none;
    }
    .filter-chip input[type="checkbox"] { accent-color: #2E7D32; }

    .map-body { flex: 1; display: flex; gap: 12px; min-height: 0; }
    .map-frame { flex: 1; position: relative; overflow: hidden; padding: 0; border-radius: 24px; height: 100%; }
    .map-frame.with-panel { flex: 2; }
    .leaflet-map { width: 100%; height: 100%; border-radius: 24px; z-index: 1; }

    .map-loading {
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      z-index: 500;
      border-radius: 24px;
      font-size: 0.9rem;
      color: #2E7D32;
      font-weight: 600;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(46, 125, 50, 0.2);
      border-top-color: #2E7D32;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .map-back-btn {
      position: absolute;
      top: 16px;
      left: 16px;
      z-index: 450;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(12px);
      border: 1.5px solid rgba(46, 125, 50, 0.3);
      border-radius: 16px;
      padding: 10px 18px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      color: #2E7D32;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
      transition: all 0.25s;
    }
    .map-back-btn:hover { background: #FFF; transform: translateY(-2px); }

    .side-panel {
      width: 360px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex-shrink: 0;
    }
    .panel-top { display: flex; justify-content: flex-end; }
    .panel-close-btn { background: none; border: none; cursor: pointer; color: #999; }
    .panel-header { display: flex; align-items: center; gap: 14px; }
    .panel-icon {
      width: 48px; height: 48px;
      background: linear-gradient(135deg, #2E7D32, #4CAF50);
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      color: #FFF; flex-shrink: 0;
    }
    .panel-title { font-size: 1.1rem; font-weight: 700; }
    .panel-divider { height: 1px; background: rgba(220, 226, 235, 0.8); }
    .panel-section-title { font-size: 0.75rem; font-weight: 700; color: #888; text-transform: uppercase; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
    .panel-indicators { display: flex; flex-direction: column; gap: 4px; }
    .indicator-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.85rem; }
    .ind-name { color: #666; }
    .ind-value { font-weight: 700; color: #2E7D32; }
    .panel-empty { font-size: 0.82rem; color: #388E3C; background: rgba(56, 142, 60, 0.08); padding: 12px; border-radius: 12px; display: flex; gap: 8px; align-items: center; }
    .alert-item { padding: 10px 14px; border-radius: 12px; margin-bottom: 6px; }
    .alert-item.critical { background: rgba(211, 47, 47, 0.08); border-left: 3px solid #D32F2F; }
    .alert-item.warning { background: rgba(245, 124, 0, 0.08); border-left: 3px solid #F57C00; }
    .alert-title { font-size: 0.82rem; font-weight: 700; display: block; }
    .alert-desc { font-size: 0.75rem; color: #666; }
    .panel-cta { margin-top: auto; text-decoration: none; width: 100%; }

    @media (max-width: 1024px) {
      .map-view-container { height: auto; min-height: none; gap: 16px; }
      .map-body { flex-direction: column; height: auto; min-height: auto; }
      .map-frame { height: 500px; flex: none; width: 100%; }
      .side-panel { width: 100%; max-height: none; flex: none; }
    }
  `]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapElement') mapElement!: ElementRef;

  mapService = inject(MapService);
  envService = inject(EnvironmentService);
  private ngZone = inject(NgZone);
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/v1';

  private map: any;
  private tileLayer: any;
  private estadosLayer: any;
  private municipiosLayer: any;
  private markersGroup: any;

  activeBasemap: 'dark' | 'satellite' | 'voyager' = 'dark';
  showPanel = false;
  selectedMunicipalityName = '';

  mapLayers = [
    { id: 'risk', label: 'Focos de Calor (Em Tempo Real)', active: true }
  ];

  private tileUrls = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    voyager: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
  };

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

    // Enquadra o mapa perfeitamente no Brasil
    this.map = L.map(this.mapElement.nativeElement, {
      zoomControl: false,
      attributionControl: false
    }).setView([-14.235, -51.925], 4.5);

    // Carrega o basemap (Padrão: Dark Neon Vibrante)
    this.tileLayer = L.tileLayer(this.tileUrls.dark, {
      attribution: '&copy; CartoDB | OpenStreetMap | EcoWatch AI',
      subdomains: 'abcd',
      maxZoom: 18
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Grupo de marcadores ambientais
    this.markersGroup = L.layerGroup().addTo(this.map);

    await this.loadEstados();
    this.addEnvironmentalHotspots();

    // Fix for Leaflet tiles getting cut off when container resizes
    if (window.ResizeObserver) {
      new ResizeObserver(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }).observe(this.mapElement.nativeElement);
    }
  }

  changeBasemap(type: 'dark' | 'satellite' | 'voyager'): void {
    this.activeBasemap = type;
    if (this.tileLayer && this.map) {
      this.map.removeLayer(this.tileLayer);
      this.tileLayer = L.tileLayer(this.tileUrls[type], {
        attribution: '&copy; CartoDB | Esri | EcoWatch AI',
        subdomains: 'abcd',
        maxZoom: 18
      }).addTo(this.map);
    }
    if (this.estadosLayer) {
      this.estadosLayer.setStyle(this.getPolygonStyle());
    }
  }

  private getPolygonStyle(): any {
    const isDark = this.activeBasemap === 'dark' || this.activeBasemap === 'satellite';
    return {
      color: isDark ? '#00E676' : '#2E7D32',
      weight: 2,
      fillColor: isDark ? '#2E7D32' : '#4CAF50',
      fillOpacity: isDark ? 0.35 : 0.25,
      dashArray: ''
    };
  }

  private async loadEstados(): Promise<void> {
    try {
      const data = await this.mapService.getEstados();

      this.estadosLayer = L.geoJSON(data, {
        style: () => this.getPolygonStyle(),
        onEachFeature: (feature: any, layer: any) => {
          const code = feature.properties?.codarea || feature.id || '';
          const name = this.mapService.getStateName(code);
          const sigla = this.mapService.getStateSigla(code);

          layer.bindTooltip(
            `<strong>${name} (${sigla})</strong><br/><small style="color:#00E676;">Clique para explorar municípios</small>`,
            { sticky: true, className: 'map-tooltip', direction: 'top', offset: [0, -10] }
          );

          layer.on({
            mouseover: (e: any) => {
              e.target.setStyle({
                fillOpacity: 0.65,
                weight: 3,
                color: '#00FF66'
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

  private addEnvironmentalHotspots(): void {
    if (!this.markersGroup) return;
    this.markersGroup.clearLayers();

    // Busca os focos e estações em tempo real da API
    this.http.get<any[]>(`${this.apiUrl}/map/hotspots`)
      .pipe(
        catchError(() => {
          // Retorna lista vazia caso a API de backend de hotspots não esteja ativa
          return of([]);
        })
      )
      .subscribe((points: any[]) => {
        points.forEach((pt: any) => {
          const color = pt.type === 'fire' ? '#D32F2F' : pt.type === 'warning' ? '#F57C00' : '#00E676';
          
          const customIcon = L.divIcon({
            className: 'custom-map-pin',
            html: `<div style="
              width: 22px; height: 22px; border-radius: 50%;
              background: ${color}; border: 3px solid #FFF;
              box-shadow: 0 0 14px ${color}; animation: pulsePin 1.5s infinite alternate;
            "></div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });

          const marker = L.marker([pt.lat, pt.lng], { icon: customIcon });
          marker.bindTooltip(`<strong>${pt.city}</strong><br/>${pt.title}`, {
            className: 'map-tooltip',
            direction: 'top'
          });

          marker.addTo(this.markersGroup);
        });
      });
  }

  private async drillDownToState(codUF: string, bounds: any): Promise<void> {
    this.showPanel = false;
    this.mapService.navigateToState(codUF);

    this.map.fitBounds(bounds, { padding: [30, 30], animate: true, duration: 0.8 });

    if (this.estadosLayer) this.map.removeLayer(this.estadosLayer);
    if (this.municipiosLayer) this.map.removeLayer(this.municipiosLayer);

    try {
      const data = await this.mapService.getMunicipios(codUF);

      this.municipiosLayer = L.geoJSON(data, {
        style: () => ({
          color: '#00E5FF',
          weight: 1,
          fillColor: '#0288D1',
          fillOpacity: 0.3,
          dashArray: ''
        }),
        onEachFeature: (feature: any, layer: any) => {
          const municipalityCode = feature.properties?.codarea || feature.id || '';
          const municipalityName = feature.properties?.nome || `Município ${municipalityCode}`;

          layer.bindTooltip(
            `<strong>${municipalityName}</strong><br/><small style="color:#00E5FF;">Clique para ver dados em tempo real</small>`,
            { sticky: true, className: 'map-tooltip', direction: 'top', offset: [0, -10] }
          );

          layer.on({
            mouseover: (e: any) => {
              e.target.setStyle({ fillOpacity: 0.6, weight: 2, color: '#00E5FF' });
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
    
    // Sincroniza a seleção do mapa com o estado global da aplicação
    const sigla = this.mapService.getStateSigla(stateCode);
    this.envService.updateCity(`${name} - ${sigla}`);
    
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

    this.map.flyTo([-14.235, -51.925], 4.5, { duration: 0.8 });
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
    if (layer.id === 'risk' && this.markersGroup) {
      if (layer.active) this.markersGroup.addTo(this.map);
      else this.map.removeLayer(this.markersGroup);
    }
  }

  private refreshIcons(): void {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 100);
  }
}
