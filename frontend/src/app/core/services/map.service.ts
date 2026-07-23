import { Injectable, signal } from '@angular/core';
import { MapNavigationState } from '../models/environment.model';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private cache = new Map<string, any>();
  private readonly IBGE_BASE = 'https://servicodados.ibge.gov.br/api/v3/malhas';

  navigationState = signal<MapNavigationState>({ level: 'country' });
  isLoading = signal<boolean>(false);

  readonly stateNames: Record<string, string> = {
    '12': 'Acre', '27': 'Alagoas', '16': 'Amapá', '13': 'Amazonas',
    '29': 'Bahia', '23': 'Ceará', '53': 'Distrito Federal', '32': 'Espírito Santo',
    '52': 'Goiás', '21': 'Maranhão', '51': 'Mato Grosso', '50': 'Mato Grosso do Sul',
    '31': 'Minas Gerais', '15': 'Pará', '25': 'Paraíba', '41': 'Paraná',
    '26': 'Pernambuco', '22': 'Piauí', '33': 'Rio de Janeiro', '24': 'Rio Grande do Norte',
    '43': 'Rio Grande do Sul', '11': 'Rondônia', '14': 'Roraima', '42': 'Santa Catarina',
    '35': 'São Paulo', '28': 'Sergipe', '17': 'Tocantins'
  };

  readonly stateSiglas: Record<string, string> = {
    '12': 'AC', '27': 'AL', '16': 'AP', '13': 'AM',
    '29': 'BA', '23': 'CE', '53': 'DF', '32': 'ES',
    '52': 'GO', '21': 'MA', '51': 'MT', '50': 'MS',
    '31': 'MG', '15': 'PA', '25': 'PB', '41': 'PR',
    '26': 'PE', '22': 'PI', '33': 'RJ', '24': 'RN',
    '43': 'RS', '11': 'RO', '14': 'RR', '42': 'SC',
    '35': 'SP', '28': 'SE', '17': 'TO'
  };

  async getEstados(): Promise<any> {
    const cacheKey = 'estados';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    this.isLoading.set(true);
    try {
      const url = `${this.IBGE_BASE}/paises/BR?formato=application/vnd.geo+json&intrarregiao=UF`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao carregar estados');
      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } finally {
      this.isLoading.set(false);
    }
  }

  async getMunicipios(codUF: string): Promise<any> {
    const cacheKey = `municipios_${codUF}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    this.isLoading.set(true);
    try {
      const url = `${this.IBGE_BASE}/estados/${codUF}?formato=application/vnd.geo+json&intrarregiao=municipio`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao carregar municípios');
      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } finally {
      this.isLoading.set(false);
    }
  }

  getStateName(code: string): string {
    return this.stateNames[code] || code;
  }

  getStateSigla(code: string): string {
    return this.stateSiglas[code] || code;
  }

  navigateToCountry(): void {
    this.navigationState.set({ level: 'country' });
  }

  navigateToState(code: string): void {
    this.navigationState.set({
      level: 'state',
      stateCode: code,
      stateName: this.getStateName(code)
    });
  }

  navigateToMunicipality(stateCode: string, municipalityCode: string, municipalityName: string): void {
    this.navigationState.set({
      level: 'municipality',
      stateCode: stateCode,
      stateName: this.getStateName(stateCode),
      municipalityCode: municipalityCode,
      municipalityName: municipalityName
    });
  }
}
