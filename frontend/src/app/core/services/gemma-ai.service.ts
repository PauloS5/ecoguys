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

  generateReport(cidade: string, uf: string, period: string): void {
    this.isGeneratingReport.set(true);
    
    const promptText = `Gere um relatório ambiental analítico e completo em texto para o município de ${cidade} - ${uf}, referente ao período de ${period}. Estruture o texto com: 
1. RESUMO DAS CONDIÇÕES CLIMÁTICAS
2. ANÁLISE DE TEMPERATURA E UMIDADE RELATIVA
3. AVALIAÇÃO DE RISCOS AMBIENTAIS E QUEIMADAS
4. RECOMENDAÇÕES PREVENTIVAS DA IA GEMMA`;

    this.http.post<{ response: string }>(`${this.apiUrl}/chat`, {
      prompt: promptText,
      system_prompt: "Você é um redator técnico e objetivo. Retorne APENAS o texto do relatório seguindo a estrutura solicitada. NUNCA adicione saudações como 'Olá' ou comentários extras.",
      cidade: cidade,
      uf: uf
    })
    .pipe(
      catchError(() => {
        return of({
          response: `RELATÓRIO AMBIENTAL DE DEMONSTRAÇÃO\nMunicípio: ${cidade} - ${uf}\nPeríodo: ${period}\n\n1. RESUMO DAS CONDIÇÕES CLIMÁTICAS\nA região de ${cidade} - ${uf} registrou estabilidade climática geral.\n\n2. ANÁLISE DE TEMPERATURA E UMIDADE\nOscilações térmicas típicas. A umidade oscilou entre 55% e 75%.\n\n3. AVALIAÇÃO DE RISCOS E QUEIMADAS\nÍndices de queimadas em nível de atenção baixa a moderada.\n\n4. RECOMENDAÇÕES PREVENTIVAS DA IA GEMMA\nManter monitoramento contínuo.`
        });
      })
    )
    .subscribe(res => {
      this.currentReportText.set(res.response);
      this.currentReportTextHtml.set(this.parseMarkdown(res.response));
      this.currentReportDate.set(new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      this.isGeneratingReport.set(false);
      
      // Update icons after a short delay since HTML is injected dynamically
      setTimeout(() => {
        if (typeof window !== 'undefined' && (window as any).lucide) {
          (window as any).lucide.createIcons();
        }
      }, 100);
    });
  }

  private parseMarkdown(text: string): string {
    if (!text) return '';
    let html = text.replace(/^### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/\n/gim, '<br>');
    return html;
  }

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
