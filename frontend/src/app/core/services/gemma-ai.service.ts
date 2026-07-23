import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChatMessage, AutomaticReport } from '../models/environment.model';
import { EnvironmentService } from './environment.service';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GemmaAiService {
  private http = inject(HttpClient);
  private envService = inject(EnvironmentService);
  // URL correta do nosso backend FastAPI
  private apiUrl = 'http://127.0.0.1:8000/api';

  chatHistory = signal<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'gemma',
      text: 'Olá! Sou o Gemma AI, assistente inteligente do EcoWatch AI. Como posso ajudar você a entender o meio ambiente hoje?',
      timestamp: new Date()
    }
  ]);

  reportsHistory = signal<AutomaticReport[]>([]);
  isTyping = signal<boolean>(false);

  // Estado do Gerador de Relatórios (persistência entre rotas)
  currentReportText = signal<string>('');
  currentReportTextHtml = signal<string>('');
  currentReportDate = signal<string>('');
  isGeneratingReport = signal<boolean>(false);

  defaultPrompts = [
    'Como está a qualidade do ar hoje?',
    'Existe risco de queimadas nesta região?',
    'O que significa um índice UV alto?',
    'Faça um resumo ambiental desta semana.'
  ];

  askGemma(question: string): void {
    if (!question.trim()) return;

    // 1. Adiciona a pergunta do usuário
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: question,
      timestamp: new Date()
    };

    this.chatHistory.update(list => [...list, userMsg]);
    this.isTyping.set(true);

    // 2. Envia a requisição real de chat para o backend local/servidor
    // Pega a cidade global para a IA saber de onde estamos falando!
    let reqCidade = 'São Paulo';
    let reqUf = 'SP';
    const globalCity = this.envService.selectedCity();
    if (globalCity) {
      const parts = globalCity.split('-');
      if (parts.length >= 2) {
        reqCidade = parts[0].trim();
        reqUf = parts[1].trim();
      }
    }

    this.http.post<{ response: string }>(`${this.apiUrl}/chat`, { 
      prompt: question,
      cidade: reqCidade,
      uf: reqUf
    })
      .pipe(
        catchError(() => {
          // Fallback amigável caso a IA esteja temporariamente offline ou a internet caia
          return of({
            response: 'O assistente inteligente Gemma está processando uma alta demanda ou está temporariamente offline. Por favor, tente novamente em instantes.'
          });
        })
      )
      .subscribe(res => {
        const gemmaMsg: ChatMessage = {
          id: Date.now().toString(),
          sender: 'gemma',
          text: res.response,
          timestamp: new Date()
        };

        this.chatHistory.update(list => [...list, gemmaMsg]);
        this.isTyping.set(false);
      });
  }
}
