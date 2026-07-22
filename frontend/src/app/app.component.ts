import { Component, AfterViewChecked } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';
import { HeaderComponent } from './core/components/header/header.component';
import { FloatingChatComponent } from './core/components/floating-chat/floating-chat.component';

declare var lucide: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, FloatingChatComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewChecked {
  title = 'EcoWatch AI';

  ngAfterViewChecked(): void {
    if (typeof window !== 'undefined' && (window as any).lucide) {
      // Verifica se há ícones pendentes para evitar loop infinito de renderização do Angular
      const pendingIcons = document.querySelectorAll('i[data-lucide]');
      if (pendingIcons.length > 0) {
        (window as any).lucide.createIcons();
      }
    }
  }
}
