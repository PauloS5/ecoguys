import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GemmaAiService } from '../../core/services/gemma-ai.service';
import { ChatMessage } from '../../core/models/environment.model';

@Component({
  selector: 'app-assistente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container glass-panel">
      
      <!-- Lateral de Histórico e Ações -->
      <div class="chat-sidebar">
        <button (click)="clearChat()" class="btn btn-primary w-100 mb-4 new-chat-btn">
          <i data-lucide="plus"></i> Nova Consulta
        </button>
        
        <div class="sidebar-section">
          <div class="chat-history-title"><i data-lucide="message-square"></i> SESSÕES ATIVAS</div>
          <div class="history-item active">
            <span class="pulse-dot"></span>
            <div class="history-details">
              <span class="history-name">Análise Geral</span>
              <span class="history-meta">Agora mesmo</span>
            </div>
          </div>
        </div>

        <div class="sidebar-info-card mt-auto">
          <div class="info-icon"><i data-lucide="sparkles"></i></div>
          <h5>Gemma 2B IT</h5>
          <p>Otimizado para análise de indicadores climáticos locais.</p>
        </div>
      </div>

      <!-- Área Principal da Conversa -->
      <div class="chat-main">
        
        <!-- Header da Conversa -->
        <div class="chat-header">
          <div class="chat-gemma-info">
            <div class="avatar-gemma-small">
              <img src="/icon.svg" alt="Gemma AI Logo" class="avatar-logo-img">
            </div>
            <div>
              <div class="header-name-row">
                <h4>Assistente Gemma AI</h4>
                <span class="model-badge">LLM</span>
              </div>
              <span class="status-subtitle"><span class="pulse-dot-green"></span> Conectado via backend seguro</span>
            </div>
          </div>
        </div>

        <!-- Stream das Mensagens -->
        <div class="chat-stream">
          <div *ngFor="let msg of gemmaService.chatHistory()" class="chat-msg" [ngClass]="msg.sender">
            <div class="msg-avatar" *ngIf="msg.sender === 'gemma'">
              <img src="/icon.svg" alt="Gemma Logo" class="avatar-logo-img">
            </div>
            <div class="msg-bubble-wrapper">
              <div class="msg-bubble">
                <p>{{ msg.text }}</p>
              </div>
              <span class="msg-time">{{ msg.timestamp | date:'HH:mm' }}</span>
            </div>
          </div>

          <!-- Balão de Digitação / Carregamento da IA -->
          <div *ngIf="gemmaService.isTyping()" class="chat-msg gemma typing">
            <div class="msg-avatar">
              <img src="/icon.svg" alt="Gemma Logo" class="avatar-logo-img">
            </div>
            <div class="msg-bubble-wrapper">
              <div class="msg-bubble typing-bubble">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Barra de Sugestões Rápidas -->
        <div class="quick-prompts-bar">
          <span class="quick-title"><i data-lucide="lightbulb"></i> Perguntar:</span>
          <div class="chips-container">
            <button *ngFor="let prompt of gemmaService.defaultPrompts" (click)="sendPrompt(prompt)" class="prompt-chip">
              {{ prompt }}
            </button>
          </div>
        </div>

        <!-- Campo de Entrada da Mensagem -->
        <div class="chat-input-box-wrapper">
          <div class="chat-input-capsule">
            <i data-lucide="message-square" class="input-icon"></i>
            <input type="text" [(ngModel)]="messageText" (keyup.enter)="sendMessage()" placeholder="Escreva sua pergunta para a IA Gemma...">
            <button (click)="sendMessage()" class="send-btn" title="Enviar Mensagem">
              <i data-lucide="send"></i>
            </button>
          </div>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .chat-container {
      display: flex;
      height: calc(100vh - 120px);
      padding: 0;
      overflow: hidden;
      border: 1.5px solid rgba(46, 125, 50, 0.22);
      box-shadow: 0 16px 40px rgba(46, 125, 50, 0.08);
    }
    
    /* Sidebar */
    .chat-sidebar {
      width: 280px;
      background: rgba(255, 255, 255, 0.65);
      border-right: 1px solid rgba(46, 125, 50, 0.15);
      padding: 24px 18px;
      display: flex;
      flex-direction: column;
      backdrop-filter: blur(10px);
    }
    .new-chat-btn {
      box-shadow: 0 6px 16px rgba(46, 125, 50, 0.2);
    }
    .chat-history-title {
      font-size: 0.72rem;
      font-weight: 700;
      color: #777;
      margin-bottom: 12px;
      letter-spacing: 0.8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .history-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      border-radius: 16px;
      background: rgba(46, 125, 50, 0.08);
      border: 1px solid rgba(46, 125, 50, 0.15);
      cursor: pointer;
      transition: all 0.25s;
    }
    .history-item:hover {
      background: rgba(46, 125, 50, 0.12);
      transform: translateX(3px);
    }
    .history-item .pulse-dot {
      width: 8px; height: 8px; background: #00E676; border-radius: 50%; box-shadow: 0 0 8px #00E676;
    }
    .history-details { display: flex; flex-direction: column; }
    .history-name { font-size: 0.85rem; font-weight: 600; color: #2E7D32; }
    .history-meta { font-size: 0.68rem; color: #777; }

    .sidebar-info-card {
      background: linear-gradient(135deg, rgba(46, 125, 50, 0.08) 0%, rgba(21, 101, 192, 0.05) 100%);
      border: 1px solid rgba(46, 125, 50, 0.2);
      border-radius: 20px;
      padding: 16px;
    }
    .info-icon {
      width: 32px; height: 32px;
      background: rgba(46, 125, 50, 0.12);
      color: #2E7D32;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 10px;
      font-size: 0.9rem;
    }
    .sidebar-info-card h5 { font-size: 0.88rem; font-weight: 700; color: #2E7D32; margin-bottom: 4px; }
    .sidebar-info-card p { font-size: 0.75rem; color: #555; line-height: 1.4; }

    /* Main Chat Area */
    .chat-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: rgba(255, 255, 255, 0.4);
    }
    
    .chat-header {
      padding: 18px 24px;
      background: rgba(255, 255, 255, 0.8);
      border-bottom: 1px solid rgba(46, 125, 50, 0.15);
    }
    .chat-gemma-info { display: flex; align-items: center; gap: 14px; }
    .avatar-gemma-small {
      width: 44px; height: 44px;
      background: #FFF;
      border: 1.5px solid rgba(46, 125, 50, 0.22);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      padding: 5px;
      box-shadow: 0 6px 16px rgba(46, 125, 50, 0.12);
    }
    .avatar-logo-img { width: 100%; height: 100%; object-fit: contain; }
    
    .header-name-row { display: flex; align-items: center; gap: 8px; }
    .header-name-row h4 { font-size: 1rem; font-weight: 700; color: #1C1C1C; }
    .model-badge {
      font-size: 0.65rem; font-weight: 700; color: #1565C0;
      background: rgba(21, 101, 192, 0.1); padding: 2px 6px; border-radius: 6px;
    }
    .status-subtitle { font-size: 0.72rem; color: #2E7D32; font-weight: 600; display: flex; align-items: center; gap: 4px; }
    .pulse-dot-green { width: 6px; height: 6px; background: #00E676; border-radius: 50%; box-shadow: 0 0 6px #00E676; }

    /* Messages Stream */
    .chat-stream {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: rgba(245, 247, 245, 0.35);
    }
    .chat-msg { display: flex; gap: 12px; max-width: 80%; }
    .chat-msg.gemma { align-self: flex-start; }
    .chat-msg.user { align-self: flex-end; flex-direction: row-reverse; }
    
    .msg-avatar {
      width: 38px; height: 38px;
      border-radius: 50%;
      background: #FFF;
      border: 1.5px solid rgba(46, 125, 50, 0.2);
      padding: 4px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    }
    
    .msg-bubble-wrapper { display: flex; flex-direction: column; gap: 4px; }
    .msg-bubble {
      background: rgba(255, 255, 255, 0.85);
      border: 1.5px solid rgba(46, 125, 50, 0.18);
      padding: 14px 18px;
      border-radius: 20px;
      font-size: 0.88rem;
      line-height: 1.5;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    }
    .chat-msg.gemma .msg-bubble {
      border-top-left-radius: 4px;
      background: rgba(255, 255, 255, 0.95);
      border-color: rgba(46, 125, 50, 0.25);
    }
    .chat-msg.user .msg-bubble {
      border-top-right-radius: 4px;
      background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%);
      color: #FFF;
      border: none;
      box-shadow: 0 6px 16px rgba(46, 125, 50, 0.18);
    }
    
    .msg-time { font-size: 0.68rem; color: #999; text-align: right; }
    .chat-msg.user .msg-time { color: rgba(255, 255, 255, 0.7); text-align: left; }

    /* Quick suggestions bar */
    .quick-prompts-bar {
      padding: 12px 24px;
      background: rgba(255, 255, 255, 0.8);
      border-top: 1px solid rgba(220, 226, 235, 0.6);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .quick-title {
      font-size: 0.78rem;
      color: #2E7D32;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }
    .chips-container {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      flex: 1;
      padding-bottom: 2px;
    }
    .chips-container::-webkit-scrollbar { height: 3px; }
    .chips-container::-webkit-scrollbar-thumb { background: rgba(46, 125, 50, 0.2); border-radius: 3px; }
    
    .prompt-chip {
      background: #FFF;
      border: 1px solid rgba(46, 125, 50, 0.2);
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 500;
      color: #444;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.25s;
    }
    .prompt-chip:hover {
      background: rgba(46, 125, 50, 0.1);
      border-color: #2E7D32;
      color: #2E7D32;
      transform: translateY(-1px);
    }

    /* Input box wrapper */
    .chat-input-box-wrapper {
      padding: 20px 24px;
      background: rgba(255, 255, 255, 0.95);
      border-top: 1px solid rgba(46, 125, 50, 0.15);
    }
    .chat-input-capsule {
      display: flex;
      align-items: center;
      background: #FFF;
      border: 1.5px solid rgba(46, 125, 50, 0.2);
      border-radius: 999px;
      padding: 4px 6px 4px 18px;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
      transition: all 0.3s;
    }
    .chat-input-capsule:focus-within {
      border-color: #2E7D32;
      box-shadow: 0 6px 20px rgba(46, 125, 50, 0.1);
    }
    .input-icon { color: #888; font-size: 1.1rem; margin-right: 10px; }
    .chat-input-capsule input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      padding: 10px 0;
      font-size: 0.88rem;
      font-family: inherit;
    }
    .send-btn {
      width: 42px; height: 42px;
      border: none;
      background: #2E7D32;
      color: #FFF;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(46, 125, 50, 0.25);
      transition: all 0.25s;
    }
    .send-btn:hover {
      background: #1B5E20;
      box-shadow: 0 6px 16px rgba(0, 230, 118, 0.35);
      transform: scale(1.05);
    }

    @media (max-width: 900px) {
      .chat-sidebar { display: none; }
      .chat-msg { max-width: 90%; }
      .quick-prompts-bar { flex-direction: column; align-items: flex-start; gap: 6px; }
    }

    /* Typing Indicator Animation */
    .typing-bubble {
      padding: 12px 20px !important;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .typing-indicator {
      display: flex;
      gap: 5px;
      align-items: center;
      height: 12px;
    }
    .typing-indicator span {
      width: 7px;
      height: 7px;
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
export class AssistantComponent {
  gemmaService = inject(GemmaAiService);
  messageText = '';

  sendPrompt(text: string): void {
    this.gemmaService.askGemma(text);
  }

  async sendMessage(): Promise<void> {
    if (!this.messageText.trim()) return;
<<<<<<< HEAD
    const text = this.messageText;
    this.messageText = '';
=======
<<<<<<< HEAD

    const userText = this.messageText;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date()
    };

    this.gemmaService.chatHistory.update(list => [...list, userMsg]);
    this.messageText = '';

    // Adiciona um feedback visual temporário, se quiser, ou só aguarda:
    const aiResponse = await this.gemmaService.sendMessageToBackend(userText);
    
    const gemmaMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'gemma',
      text: aiResponse,
      timestamp: new Date()
    };
    
    this.gemmaService.chatHistory.update(list => [...list, gemmaMsg]);
=======
    const text = this.messageText;
    this.messageText = '';
>>>>>>> 3701c4f982dc1f66370f082dd01db1137a08470a
    this.gemmaService.askGemma(text);
  }

  clearChat(): void {
    this.gemmaService.chatHistory.set([
      {
        id: 'welcome',
        sender: 'gemma',
        text: 'Olá! Sou o Gemma AI, assistente inteligente do EcoWatch AI. Como posso ajudar você a entender o meio ambiente hoje?',
        timestamp: new Date()
      }
    ]);
<<<<<<< HEAD
=======
>>>>>>> 4e456ae (Front: correção de bugs e atualizações)
>>>>>>> 3701c4f982dc1f66370f082dd01db1137a08470a
  }
}
