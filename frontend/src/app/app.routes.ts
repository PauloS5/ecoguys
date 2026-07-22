import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'mapa', loadComponent: () => import('./features/mapa/mapa.component').then(m => m.MapComponent) },
  { path: 'assistente', loadComponent: () => import('./features/assistente/assistente.component').then(m => m.AssistantComponent) },
  { path: 'relatorios', loadComponent: () => import('./features/relatorios/relatorios.component').then(m => m.ReportsComponent) },
  { path: 'alertas', loadComponent: () => import('./features/alertas/alertas.component').then(m => m.AlertsComponent) },
  { path: 'configuracoes', loadComponent: () => import('./features/configuracoes/configuracoes.component').then(m => m.SettingsComponent) },
  { path: '**', redirectTo: 'dashboard' }
];
