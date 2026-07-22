import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChatMessage, AutomaticReport } from '../models/environment.model';
<<<<<<< HEAD
import { firstValueFrom } from 'rxjs';
=======
import { catchError, of } from 'rxjs';
>>>>>>> 4e456ae (Front: correção de bugs e atualizações)

@Injectable({
  providedIn: 'root'
})
export class GemmaAiService {
  private http = inject(HttpClient);
<<<<<<< HEAD
  
=======
  private apiUrl = 'http://localhost:8000/api/v1';

>>>>>>> 4e456ae (Front: correção de bugs e atualizações)
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

  defaultPrompts = [
    'Como está a qualidade do ar hoje?',
    'Existe risco de queimadas nesta região?',
    'O que significa um índice UV alto?',
    'Faça um resumo ambiental desta semana.'
  ];

<<<<<<< HEAD
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
=======
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
    this.http.post<{ response: string }>(`${this.apiUrl}/gemma/chat`, { message: question })
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
>>>>>>> 4e456ae (Front: correção de bugs e atualizações)
  }
}
