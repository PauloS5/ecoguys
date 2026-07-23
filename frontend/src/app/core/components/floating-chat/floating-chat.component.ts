import { Component, ElementRef, ViewChild, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GemmaAiService } from '../../services/gemma-ai.service';

declare const lucide: any;

@Component({
  selector: 'app-floating-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Container Principal do Chat Flutuante -->
    <div class="floating-chat-wrapper">

      <!-- 1. ESTADO MINIATURIZADO (BOTÃO FLUTUANTE) -->
      <div *ngIf="!isExpanded" (click)="expandChat()" class="floating-mini-pill glass-panel">
        <div class="mini-avatar">
          <img src="/icon.svg" alt="Gemma AI Logo" class="mini-logo-img">
          <span class="mini-pulse"></span>
        </div>
        <div class="mini-content">
          <span class="mini-title">Gemma AI</span>
          <span class="mini-subtitle">Perguntar ao assistente...</span>
        </div>
        <div class="mini-sparkle-badge">
          <i data-lucide="sparkles"></i>
        </div>
      </div>

      <!-- 2. ESTADO EXPANDIDO (JANELA COMPLETA EM GLASSMORPHISM) -->
      <div *ngIf="isExpanded" class="floating-chat-window glass-panel">
        
        <!-- Header do Chat -->
        <div class="chat-header">
          <div class="chat-brand">
            <div class="gemma-avatar">
              <img src="/icon.svg" alt="Gemma AI Logo" class="avatar-logo-img">
            </div>
            <div>
              <h4 class="gemma-name">Assistente Gemma AI</h4>
              <span class="gemma-status"><span class="pulse-dot"></span> Online • Resposta em tempo real</span>
            </div>
          </div>
          <div class="chat-controls">
            <button (click)="collapseChat()" class="control-btn" title="Minimizar">
              <i data-lucide="minus"></i>
            </button>
            <button (click)="collapseChat()" class="control-btn" title="Fechar">
              <i data-lucide="x"></i>
            </button>
          </div>
        </div>

        <!-- Stream de Mensagens -->
        <div #scrollContainer class="chat-stream-body">
          <div *ngFor="let msg of gemmaService.chatHistory()" class="chat-msg-row" [ngClass]="msg.sender">
            <div class="msg-avatar" *ngIf="msg.sender === 'gemma'">
              <img src="/icon.svg" alt="Gemma Logo" class="avatar-logo-img">
            </div>
            <div class="msg-bubble">
              <p [innerHTML]="parseMarkdown(msg.text)"></p>
              <span class="msg-time">{{ msg.timestamp | date:'HH:mm' }}</span>
            </div>
          </div>

          <!-- Balão de Digitação / Carregamento da IA -->
          <div *ngIf="gemmaService.isTyping()" class="chat-msg-row gemma typing">
            <div class="msg-avatar">
              <img src="/icon.svg" alt="Gemma Logo" class="avatar-logo-img">
            </div>
            <div class="msg-bubble typing-bubble">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sugestões Rápidas -->
        <div class="quick-chips-bar">
          <button *ngFor="let prompt of gemmaService.defaultPrompts" (click)="sendPrompt(prompt)" class="chip-btn">
            {{ prompt }}
          </button>
        </div>

        <!-- Input de Envio de Mensagem -->
        <div class="chat-input-row">
          <input type="text"
                 [(ngModel)]="userMessage"
                 (keyup.enter)="submitMessage()"
                 placeholder="Digite sua dúvida sobre o meio ambiente..."
                 class="chat-input">
          <button (click)="submitMessage()" class="send-btn btn-primary">
            <i data-lucide="send"></i>
          </button>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .floating-chat-wrapper {
      position: fixed;
      bottom: 90px;
      right: 24px;
      z-index: 9999;
      font-family: var(--font-family);
    }

    /* ===== MINIATURA (BOTÃO FLUTUANTE) ===== */
    .floating-mini-pill {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 18px;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      border: 1.5px solid rgba(46, 125, 50, 0.3);
      border-radius: 999px;
      box-shadow: 0 10px 30px rgba(46, 125, 50, 0.18);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
    }
    .floating-mini-pill:hover {
      background: #FFFFFF;
      transform: translateY(-3px) scale(1.03);
      box-shadow: 0 14px 36px rgba(46, 125, 50, 0.25);
      border-color: #2E7D32;
    }
    .mini-avatar {
      position: relative;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(46, 125, 50, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
    }
    .mini-logo-img { width: 100%; height: 100%; object-fit: contain; }
    .mini-pulse {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 10px;
      height: 10px;
      background: #00E676;
      border-radius: 50%;
      border: 2px solid #FFF;
      box-shadow: 0 0 8px #00E676;
    }
    .mini-content { display: flex; flex-direction: column; }
    .mini-title { font-size: 0.88rem; font-weight: 700; color: #2E7D32; }
    .mini-subtitle { font-size: 0.72rem; color: #777; }
    .mini-sparkle-badge {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #2E7D32, #1565C0);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFF;
      font-size: 0.85rem;
    }

    /* ===== JANELA EXPANDIDA (GLASSMORPHISM) ===== */
    .floating-chat-window {
      width: 380px;
      height: 520px;
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1.5px solid rgba(46, 125, 50, 0.25);
      border-radius: 24px;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15), 0 0 20px rgba(46, 125, 50, 0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 0;
      animation: expandIn 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes expandIn {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Header */
    .chat-header {
      padding: 14px 18px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(238, 247, 238, 0.9) 100%);
      border-bottom: 1px solid rgba(220, 226, 235, 0.8);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .chat-brand { display: flex; align-items: center; gap: 10px; }
    .gemma-avatar {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(46, 125, 50, 0.2);
      border-radius: 12px;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .avatar-logo-img { width: 100%; height: 100%; object-fit: contain; }
    .gemma-name { font-size: 0.92rem; font-weight: 700; color: #1C1C1C; }
    .gemma-status { font-size: 0.7rem; color: #2E7D32; font-weight: 600; display: flex; align-items: center; gap: 4px; }
    .pulse-dot { width: 6px; height: 6px; background: #00E676; border-radius: 50%; box-shadow: 0 0 6px #00E676; }
    
    .chat-controls { display: flex; gap: 4px; }
    .control-btn {
      background: none;
      border: none;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      color: #888;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .control-btn:hover { background: rgba(0, 0, 0, 0.06); color: #333; }

    /* Messages Body */
    .chat-stream-body {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: rgba(245, 247, 250, 0.5);
    }
    .chat-msg-row { display: flex; gap: 8px; max-width: 85%; }
    .chat-msg-row.gemma { align-self: flex-start; }
    .chat-msg-row.user { align-self: flex-end; flex-direction: row-reverse; }
    .msg-avatar {
      width: 32px;
      height: 32px;
      background: #FFF;
      border: 1px solid rgba(46, 125, 50, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3px;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    .msg-bubble {
      background: #FFF;
      border: 1px solid rgba(220, 226, 235, 0.9);
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 0.82rem;
      line-height: 1.45;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    }
    .chat-msg-row.user .msg-bubble {
      background: linear-gradient(135deg, #2E7D32, #1B5E20);
      color: #FFF;
      border: none;
    }
    .msg-time { display: block; font-size: 0.65rem; color: #999; margin-top: 4px; text-align: right; }
    .chat-msg-row.user .msg-time { color: rgba(255, 255, 255, 0.7); }

    /* Chips */
    .quick-chips-bar {
      padding: 8px 12px;
      display: flex;
      gap: 6px;
      overflow-x: auto;
      background: rgba(255, 255, 255, 0.8);
      border-top: 1px solid rgba(220, 226, 235, 0.6);
    }
    .quick-chips-bar::-webkit-scrollbar { height: 3px; }
    .quick-chips-bar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
    .chip-btn {
      background: #FFF;
      border: 1px solid rgba(46, 125, 50, 0.2);
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 0.72rem;
      color: #444;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.2s;
    }
    .chip-btn:hover { background: rgba(46, 125, 50, 0.1); color: #2E7D32; border-color: #2E7D32; }

    /* Input */
    .chat-input-row {
      padding: 12px 14px;
      background: #FFF;
      border-top: 1px solid rgba(220, 226, 235, 0.8);
      display: flex;
      gap: 8px;
    }
    .chat-input {
      flex: 1;
      padding: 10px 14px;
      border-radius: 14px;
      border: 1px solid rgba(220, 226, 235, 0.8);
      outline: none;
      font-family: inherit;
      font-size: 0.82rem;
    }
    .chat-input:focus { border-color: #2E7D32; }
    .send-btn {
      width: 38px;
      height: 38px;
      padding: 0;
      border-radius: 14px;
      flex-shrink: 0;
    }

    /* ===== Responsividade Mobile ===== */
    @media (max-width: 480px) {
      .floating-chat-wrapper {
        bottom: 90px;
        right: 16px;
      }
      .floating-chat-window {
        width: calc(100vw - 32px);
        height: 75vh;
      }
      .mini-subtitle { display: none; }
    }

    /* Typing Indicator Animation */
    .typing-bubble {
      padding: 8px 14px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    }
    .typing-indicator {
      display: flex;
      gap: 4px;
      align-items: center;
      height: 10px;
    }
    .typing-indicator span {
      width: 6px;
      height: 6px;
      background: #2E7D32;
      border-radius: 50%;
      display: inline-block;
      animation: bounce 1.4s infinite ease-in-out both;
    }
    .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
    .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0.2); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }
  `]
})
export class FloatingChatComponent implements AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  gemmaService = inject(GemmaAiService);
  isExpanded = false;
  userMessage = '';

  expandChat(): void {
    this.isExpanded = true;
    this.refreshLucide();
    this.scrollToBottom();
  }

  collapseChat(): void {
    this.isExpanded = false;
  }

  sendPrompt(promptText: string): void {
    this.userMessage = promptText;
    this.submitMessage();
  }

  submitMessage(): void {
    if (!this.userMessage.trim()) return;
    const text = this.userMessage;
    this.userMessage = '';
    
    if (!this.isExpanded) {
      this.isExpanded = true;
    }

    this.gemmaService.askGemma(text);
    this.scrollToBottom();
    this.refreshLucide();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }

  private refreshLucide(): void {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 100);
  }

  parseMarkdown(text: string): string {
    if (!text) return '';
    let html = text.replace(/^### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/\n/gim, '<br>');
    return html;
  }
}
