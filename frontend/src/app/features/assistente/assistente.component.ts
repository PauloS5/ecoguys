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
      
      <div class="chat-sidebar">
        <button class="btn btn-primary w-100 mb-3">
          <i data-lucide="plus"></i> Nova Consulta
        </button>
        <div class="chat-history-title">HISTÓRICO</div>
        <div class="empty-state-small">
          <span>Nenhuma conversa anterior</span>
        </div>
      </div>

      <div class="chat-main">
        <div class="chat-header">
          <div class="chat-gemma-info">
            <div class="avatar-gemma-small">
              <i data-lucide="sparkles"></i>
            </div>
            <div>
              <h4>Assistente Gemma AI</h4>
              <span class="text-sub small">Faça perguntas sobre o meio ambiente em linguagem natural</span>
            </div>
          </div>
        </div>

        <div class="chat-stream">
          <div *ngFor="let msg of gemmaService.chatHistory()" class="chat-msg" [ngClass]="msg.sender">
            <div class="msg-avatar"><i data-lucide="sparkles"></i></div>
            <div class="msg-bubble">
              <p>{{ msg.text }}</p>
            </div>
          </div>
        </div>

        <div class="quick-prompts-bar">
          <span class="quick-title">Sugestões:</span>
          <button *ngFor="let prompt of gemmaService.defaultPrompts" (click)="sendPrompt(prompt)" class="prompt-chip">
            {{ prompt }}
          </button>
        </div>

        <div class="chat-input-box">
          <input type="text" [(ngModel)]="messageText" (keyup.enter)="sendMessage()" placeholder="Digite sua pergunta...">
          <button (click)="sendMessage()" class="btn btn-primary btn-icon">
            <i data-lucide="send"></i>
          </button>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .chat-container { display: flex; height: calc(100vh - 110px); padding: 0; overflow: hidden; }
    .chat-sidebar { width: 260px; background: rgba(255, 255, 255, 0.6); border-right: 1px solid rgba(220, 226, 235, 0.8); padding: 24px; display: flex; flex-direction: column; }
    .chat-history-title { font-size: 0.72rem; font-weight: 700; color: #999; margin-bottom: 12px; }
    .empty-state-small { font-size: 0.78rem; color: #999; }
    .chat-main { flex: 1; display: flex; flex-direction: column; }
    .chat-header { padding: 16px 24px; border-bottom: 1px solid rgba(220, 226, 235, 0.8); }
    .chat-gemma-info { display: flex; align-items: center; gap: 12px; }
    .avatar-gemma-small { width: 38px; height: 38px; background: linear-gradient(135deg, #2E7D32, #1565C0); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #FFF; }
    .chat-stream { flex: 1; padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
    .chat-msg { display: flex; gap: 12px; max-width: 85%; }
    .chat-msg.gemma { align-self: flex-start; }
    .chat-msg.user { align-self: flex-end; flex-direction: row-reverse; }
    .msg-avatar { width: 36px; height: 36px; border-radius: 50%; background: #2E7D32; color: #FFF; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .msg-bubble { background: #FFF; border: 1px solid rgba(220, 226, 235, 0.8); padding: 14px 18px; border-radius: 16px; font-size: 0.88rem; }
    .chat-msg.user .msg-bubble { background: #2E7D32; color: #FFF; border: none; }
    .quick-prompts-bar { padding: 8px 24px; display: flex; align-items: center; gap: 8px; overflow-x: auto; }
    .quick-title { font-size: 0.75rem; color: #999; font-weight: 600; flex-shrink: 0; }
    .prompt-chip { background: #FFF; border: 1px solid rgba(220, 226, 235, 0.8); padding: 6px 12px; border-radius: 999px; font-size: 0.78rem; cursor: pointer; white-space: nowrap; }
    .chat-input-box { padding: 24px; border-top: 1px solid rgba(220, 226, 235, 0.8); display: flex; gap: 10px; }
    .chat-input-box input { flex: 1; padding: 12px 18px; border-radius: 16px; border: 1px solid rgba(220, 226, 235, 0.8); outline: none; }
    .btn-icon { width: 44px; height: 44px; padding: 0; border-radius: 16px; }
  `]
})
export class AssistantComponent {
  gemmaService = inject(GemmaAiService);
  messageText = '';

  sendPrompt(text: string): void {
    this.messageText = text;
    this.sendMessage();
  }

  async sendMessage(): Promise<void> {
    if (!this.messageText.trim()) return;

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
  }
}
