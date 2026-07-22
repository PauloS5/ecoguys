import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-box">
          <div class="logo-icon">
            <i data-lucide="shield-check"></i>
          </div>
          <div class="logo-text">
            <span class="logo-name">EcoWatch AI</span>
            <span class="logo-tag">MONITORAMENTO AMBIENTAL</span>
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <i data-lucide="layout-dashboard"></i>
          <span>Dashboard</span>
        </a>
        <a routerLink="/mapa" routerLinkActive="active" class="nav-item">
          <i data-lucide="map-pin"></i>
          <span>Mapa Interativo</span>
        </a>
        <a routerLink="/assistente" routerLinkActive="active" class="nav-item">
          <i data-lucide="bot"></i>
          <span>Assistente Gemma</span>
          <span class="badge-sparkle">IA</span>
        </a>
        <a routerLink="/relatorios" routerLinkActive="active" class="nav-item">
          <i data-lucide="file-bar-chart"></i>
          <span>Relatórios</span>
        </a>
        <a routerLink="/alertas" routerLinkActive="active" class="nav-item">
          <i data-lucide="bell"></i>
          <span>Alertas</span>
          <span class="badge-alert-count">0</span>
        </a>
        <a routerLink="/configuracoes" routerLinkActive="active" class="nav-item">
          <i data-lucide="settings"></i>
          <span>Configurações</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="ai-status-card">
          <div class="ai-status-indicator">
            <span class="pulse-dot"></span>
            <span>Gemma AI</span>
          </div>
          <p class="ai-status-desc">Assistente inteligente ativo</p>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 100;
      background: rgba(255, 255, 255, 0.78);
      backdrop-filter: blur(16px);
      border-right: 1px solid rgba(220, 226, 235, 0.8);
      display: flex;
      flex-direction: column;
      padding: 24px 16px;
    }
    .sidebar-header { margin-bottom: 32px; padding-left: 8px; }
    .logo-box { display: flex; align-items: center; gap: 8px; }
    .logo-icon {
      width: 44px; height: 44px;
      background: linear-gradient(135deg, #2E7D32, #4CAF50);
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center; color: #FFF;
    }
    .logo-text { display: flex; flex-direction: column; }
    .logo-name { font-size: 1.2rem; font-weight: 700; color: #2E7D32; }
    .logo-tag { font-size: 0.62rem; font-weight: 600; letter-spacing: 1px; color: #1565C0; }
    .sidebar-nav { display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px; border-radius: 16px;
      color: #666; font-size: 0.9rem; font-weight: 500;
      text-decoration: none; transition: all 0.3s;
    }
    .nav-item:hover { background: rgba(46, 125, 50, 0.12); color: #2E7D32; transform: translateX(4px); }
    .nav-item.active { background: #2E7D32; color: #FFF; font-weight: 600; }
    .badge-sparkle { margin-left: auto; font-size: 0.7rem; background: linear-gradient(135deg, #1565C0, #FB8C00); color: #FFF; padding: 2px 8px; border-radius: 999px; }
    .badge-alert-count { margin-left: auto; font-size: 0.75rem; background: #D32F2F; color: #FFF; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .sidebar-footer { margin-top: auto; padding-top: 16px; }
    .ai-status-card { background: rgba(21, 101, 192, 0.06); border: 1px solid rgba(21, 101, 192, 0.15); border-radius: 16px; padding: 12px; }
    .ai-status-indicator { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 600; color: #1565C0; }
    .pulse-dot { width: 8px; height: 8px; background: #00E676; border-radius: 50%; }
    .ai-status-desc { font-size: 0.72rem; color: #666; margin-top: 4px; }
  `]
})
export class SidebarComponent {}
