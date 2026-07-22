import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnvironmentService } from '../../services/environment.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="header-left">
        <div class="search-box">
          <i data-lucide="search"></i>
          <input type="text" placeholder="Buscar município...">
        </div>
        <div class="location-selector">
          <i data-lucide="map-pin"></i>
          <select [value]="envService.selectedCity()" (change)="onCityChange($event)">
            <option value="Rio Branco - AC">Rio Branco - AC</option>
            <option value="Manaus - AM">Manaus - AM</option>
            <option value="Cuiabá - MT">Cuiabá - MT</option>
            <option value="Belém - PA">Belém - PA</option>
            <option value="Porto Velho - RO">Porto Velho - RO</option>
          </select>
        </div>
      </div>

      <div class="header-right">
        <button class="btn btn-secondary btn-sm">
          <i data-lucide="refresh-cw"></i>
          <span>Atualizar</span>
        </button>

        <button class="btn-icon-badge" title="Alertas">
          <i data-lucide="bell"></i>
          <span class="notification-badge">0</span>
        </button>

        <div class="user-profile">
          <div class="avatar-placeholder">
            <i data-lucide="user"></i>
          </div>
          <div class="user-info">
            <span class="user-name">Usuário</span>
          </div>
          <i data-lucide="chevron-down"></i>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      height: 72px;
      position: sticky;
      top: 0;
      z-index: 90;
      background: rgba(255, 255, 255, 0.78);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(220, 226, 235, 0.8);
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header-left, .header-right { display: flex; align-items: center; gap: 16px; }
    .search-box {
      display: flex; align-items: center; gap: 8px;
      background: #FFF; border: 1px solid rgba(220, 226, 235, 0.8);
      border-radius: 16px; padding: 8px 16px; width: 280px;
    }
    .search-box input { border: none; outline: none; background: transparent; width: 100%; font-size: 0.85rem; }
    .location-selector {
      display: flex; align-items: center; gap: 6px;
      background: rgba(255, 255, 255, 0.9); border: 1px solid rgba(220, 226, 235, 0.8);
      border-radius: 16px; padding: 8px 12px; color: #2E7D32;
    }
    .location-selector select { border: none; outline: none; background: transparent; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
    .btn-icon-badge {
      position: relative; width: 40px; height: 40px; border-radius: 16px;
      background: #FFF; border: 1px solid rgba(220, 226, 235, 0.8);
      display: flex; align-items: center; justify-content: center; cursor: pointer;
    }
    .notification-badge {
      position: absolute; top: -4px; right: -4px; background: #D32F2F; color: #FFF;
      font-size: 0.68rem; font-weight: 700; width: 18px; height: 18px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; border: 2px solid #FFF;
    }
    .user-profile { display: flex; align-items: center; gap: 10px; padding: 4px 8px; cursor: pointer; }
    .avatar-placeholder { width: 38px; height: 38px; border-radius: 50%; background: rgba(46, 125, 50, 0.12); color: #2E7D32; display: flex; align-items: center; justify-content: center; }
    .user-info { display: flex; flex-direction: column; }
    .user-name { font-size: 0.88rem; font-weight: 600; }
  `]
})
export class HeaderComponent {
  envService = inject(EnvironmentService);

  onCityChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.envService.updateCity(val);
  }
}
