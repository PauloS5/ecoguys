import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Overlay transparente para fechar no mobile -->
    <div *ngIf="isOpenMobile" (click)="toggleMobileMenu()" class="sidebar-mobile-overlay"></div>

    <aside class="sidebar glass-panel" [class.mobile-open]="isOpenMobile">
      <div class="sidebar-header">
        <div class="logo-box">
          <img src="/icon.svg" alt="EcoWatch AI Logo" class="brand-logo-img">
          <div class="logo-text">
            <span class="logo-name">EcoWatch AI</span>
            <span class="logo-tag">MONITORAMENTO AMBIENTAL</span>
          </div>
          <button (click)="toggleMobileMenu()" class="mobile-close-btn">
            <i data-lucide="x"></i>
          </button>
        </div>
      </div>

      <nav class="sidebar-nav">
        <a routerLink="/dashboard" (click)="closeMobileOnNav()" routerLinkActive="active" class="nav-item">
          <i data-lucide="layout-dashboard"></i>
          <span>Dashboard</span>
        </a>
        <a routerLink="/mapa" (click)="closeMobileOnNav()" routerLinkActive="active" class="nav-item">
          <i data-lucide="map-pin"></i>
          <span>Mapa Interativo</span>
        </a>
        <a routerLink="/assistente" (click)="closeMobileOnNav()" routerLinkActive="active" class="nav-item">
          <i data-lucide="bot"></i>
          <span>Assistente Gemma</span>
          <span class="badge-sparkle">IA</span>
        </a>
        <a routerLink="/relatorios" (click)="closeMobileOnNav()" routerLinkActive="active" class="nav-item">
          <i data-lucide="file-bar-chart"></i>
          <span>Relatórios</span>
        </a>
        <a routerLink="/configuracoes" (click)="closeMobileOnNav()" routerLinkActive="active" class="nav-item">
          <i data-lucide="info"></i>
          <span>Informações</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="ai-status-card">
          <div class="ai-status-indicator">
            <span class="pulse-dot"></span>
            <span>Gemma AI: Online</span>
          </div>
          <p class="ai-status-desc">IA ativa para análises em tempo real</p>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-mobile-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      z-index: 99;
    }

    .sidebar {
      width: 250px;
      height: calc(100vh - 32px);
      position: fixed;
      top: 16px;
      left: 16px;
      z-index: 100;
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(46, 125, 50, 0.2);
      border-radius: 24px;
      box-shadow: 0 12px 40px 0 rgba(46, 125, 50, 0.1);
      display: flex;
      flex-direction: column;
      padding: 24px 16px;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sidebar-header { margin-bottom: 28px; padding-left: 4px; }
    .logo-box { display: flex; align-items: center; gap: 12px; position: relative; }
    .brand-logo-img {
      width: 38px;
      height: 38px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .logo-text { display: flex; flex-direction: column; }
    .logo-name { font-size: 1.15rem; font-weight: 700; color: #2E7D32; }
    .logo-tag { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.8px; color: #1565C0; }

    .mobile-close-btn {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      color: #777;
      margin-left: auto;
    }

    .sidebar-nav { display: flex; flex-direction: column; gap: 8px; flex: 1; }
    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px; border-radius: 16px;
      color: #555; font-size: 0.88rem; font-weight: 500;
      text-decoration: none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .nav-item:hover { background: rgba(46, 125, 50, 0.1); color: #2E7D32; transform: translateX(4px); }
    .nav-item.active { background: linear-gradient(135deg, #2E7D32, #1B5E20); color: #FFF; font-weight: 600; box-shadow: 0 6px 18px rgba(46, 125, 50, 0.25); }
    .badge-sparkle { margin-left: auto; font-size: 0.7rem; font-weight: 700; background: linear-gradient(135deg, #1565C0, #FB8C00); color: #FFF; padding: 2px 8px; border-radius: 999px; }
    .badge-alert-count { margin-left: auto; font-size: 0.75rem; background: #D32F2F; color: #FFF; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
    .sidebar-footer { margin-top: auto; padding-top: 16px; }
    .ai-status-card { background: rgba(46, 125, 50, 0.08); border: 1px solid rgba(46, 125, 50, 0.2); border-radius: 16px; padding: 12px; }
    .ai-status-indicator { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 600; color: #2E7D32; }
    .pulse-dot { width: 8px; height: 8px; background: #00E676; border-radius: 50%; box-shadow: 0 0 8px #00E676; }
    .ai-status-desc { font-size: 0.72rem; color: #666; margin-top: 4px; }

    /* ===== Media Query Responsivo ===== */
    @media (max-width: 1024px) {
      .sidebar {
        transform: translateX(-280px);
        box-shadow: none;
      }
      .sidebar.mobile-open {
        transform: translateX(0);
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
      }
      .mobile-close-btn { display: block; }
    }
  `]
})
export class SidebarComponent {
  isOpenMobile = false;

  toggleMobileMenu(): void {
    this.isOpenMobile = !this.isOpenMobile;
  }

  closeMobileOnNav(): void {
    if (this.isOpenMobile) {
      this.isOpenMobile = false;
    }
  }
}
