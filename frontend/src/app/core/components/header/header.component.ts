import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { EnvironmentService } from '../../services/environment.service';

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
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="header">
      <div class="header-left">
        <!-- Botão Menu Hambúrguer Mobile -->
        <button (click)="toggleMobileSidebar()" class="btn-menu-hamburger" title="Abrir Menu">
          <i data-lucide="menu"></i>
        </button>

        <!-- Seletor Encadeado de Estado e Município no Topo -->
        <div class="header-location-group">
          
          <div class="location-selector state-select">
            <i data-lucide="map"></i>
            <select [(ngModel)]="selectedStateSigla" (change)="onStateChange()" [disabled]="loadingStates">
              <option *ngIf="loadingStates" value="">Carregando...</option>
              <option *ngFor="let st of statesList" [value]="st.sigla">
                {{ st.sigla }} - {{ st.nome }}
              </option>
            </select>
          </div>

          <div class="location-selector city-select">
            <i data-lucide="map-pin"></i>
            <select [(ngModel)]="selectedCityName" (change)="onCityChange()" [disabled]="loadingCities">
              <option *ngIf="loadingCities" value="">Carregando...</option>
              <option *ngFor="let city of availableCities" [value]="city.nome">
                {{ city.nome }}
              </option>
            </select>
          </div>

        </div>
      </div>

      <div class="header-right">
        <button (click)="refreshData()" class="btn btn-secondary btn-sm" title="Carregar / Atualizar dados">
          <i data-lucide="refresh-cw"></i>
          <span class="hide-mobile">Atualizar Dados</span>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .header {
      height: 72px;
      position: sticky;
      top: 0;
      z-index: 90;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(46, 125, 50, 0.15);
      border-radius: 20px;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 20px rgba(46, 125, 50, 0.05);
    }
    .header-left, .header-right { display: flex; align-items: center; gap: 14px; }
    
    .btn-menu-hamburger {
      display: none;
      background: #FFF;
      border: 1px solid rgba(46, 125, 50, 0.2);
      border-radius: 12px;
      width: 40px;
      height: 40px;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #2E7D32;
    }

    .header-location-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .location-selector {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.95);
      border: 1.5px solid rgba(46, 125, 50, 0.22);
      border-radius: 16px;
      padding: 8px 14px;
      color: #2E7D32;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    }
    .location-selector select {
      border: none;
      outline: none;
      background: transparent;
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
      color: #1C1C1C;
      font-family: inherit;
    }
    .location-selector select:disabled { opacity: 0.6; cursor: wait; }

    /* ===== Media Queries Responsivos ===== */
    @media (max-width: 1024px) {
      .btn-menu-hamburger { display: flex; }
      .header { padding: 0 16px; }
    }

    @media (max-width: 768px) {
      .header-location-group { flex-direction: column; gap: 6px; align-items: flex-start; }
      .location-selector { padding: 4px 8px; }
      .location-selector select { font-size: 0.78rem; }
      .hide-mobile { display: none !important; }
      .header-left, .header-right { gap: 8px; }
    }
  `]
})
export class HeaderComponent implements OnInit {
  envService = inject(EnvironmentService);
  private http = inject(HttpClient);
  private ibgeUrl = 'https://servicodados.ibge.gov.br/api/v1/localidades';

  statesList: StateIBGE[] = [];
  availableCities: CityIBGE[] = [];

  selectedStateSigla = 'AC';
  selectedCityName = 'Rio Branco';

  loadingStates = true;
  loadingCities = false;

  ngOnInit(): void {
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
          this.selectedStateSigla = 'AC';
          this.fetchCities('AC');
        }
      });
  }

  onStateChange(): void {
    if (this.selectedStateSigla) {
      this.fetchCities(this.selectedStateSigla);
    }
  }

  fetchCities(uf: string): void {
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
          this.selectedCityName = cities[0].nome;
          this.notifyEnvironmentService();
        }
      });
  }

  onCityChange(): void {
    this.notifyEnvironmentService();
  }

  notifyEnvironmentService(): void {
    const fullCityString = `${this.selectedCityName} - ${this.selectedStateSigla}`;
    this.envService.updateCity(fullCityString);
  }

  toggleMobileSidebar(): void {
    const sidebarEl = document.querySelector('.sidebar') as HTMLElement;
    const overlayEl = document.querySelector('.sidebar-mobile-overlay') as HTMLElement;
    if (sidebarEl) {
      sidebarEl.classList.toggle('mobile-open');
    }
    if (overlayEl) {
      overlayEl.style.display = overlayEl.style.display === 'block' ? 'none' : 'block';
    }
  }

  refreshData(): void {
    this.notifyEnvironmentService();
  }
}
