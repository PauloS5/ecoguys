import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChatMessage, AutomaticReport } from '../models/environment.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GemmaAiService {
  private http = inject(HttpClient);
  
  chatHistory = signal<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'gemma',
      text: 'Olá! Sou o Gemma AI, assistente inteligente do EcoWatch AI. Como posso ajudar você hoje?',
      timestamp: new Date()
    }
  ]);

  reportsHistory = signal<AutomaticReport[]>([]);

  defaultPrompts = [
    'Como está a qualidade do ar hoje?',
    'Existe risco de queimadas nesta região?',
    'O que significa um índice UV alto?',
    'Faça um resumo ambiental desta semana.'
  ];

  async sendMessageToBackend(prompt: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.http.post<{response: string}>('http://127.0.0.1:8000/api/chat', { prompt })
      );
      return response.response;
    } catch (error) {
      console.error('Erro ao conectar com a IA:', error);
      return 'Desculpe, ocorreu um erro ao conectar com o servidor da Inteligência Artificial. Verifique se o backend está rodando.';
    }
  }
}
