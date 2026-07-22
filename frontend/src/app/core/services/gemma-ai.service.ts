import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChatMessage, AutomaticReport } from '../models/environment.model';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GemmaAiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/v1';
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

  askGemma(question: string): void {
    if (!question.trim()) return;

    // Add user question to chat history
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: question,
      timestamp: new Date()
    };
    this.chatHistory.update(list => [...list, userMsg]);
    this.isTyping.set(true);

    // Send request to backend
    this.http.post<{ response: string }>(`${this.apiUrl}/gemma/chat`, { message: question })
      .pipe(
        catchError(() => {
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
