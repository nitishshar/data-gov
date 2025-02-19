import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FilterOption, FilterOperand, FilterConfig } from '../models/sql-filter.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FilterOptionsService {
  private config: FilterConfig | null = null;
  private mockData = {
    divisions: [
      { value: 'div1', label: 'Division 1' },
      { value: 'div2', label: 'Division 2' },
      { value: 'div3', label: 'Division 3' }
    ],
    'cost-centers': [
      { value: 'cc1', label: 'Cost Center 1' },
      { value: 'cc2', label: 'Cost Center 2' },
      { value: 'cc3', label: 'Cost Center 3' }
    ],
    managers: [
      { value: 'mgr1', label: 'Manager 1' },
      { value: 'mgr2', label: 'Manager 2' },
      { value: 'mgr3', label: 'Manager 3' }
    ],
    locations: [
      { value: 'loc1', label: 'Location 1' },
      { value: 'loc2', label: 'Location 2' },
      { value: 'loc3', label: 'Location 3' }
    ],
    users: [
      { value: 'usr1', label: 'User 1' },
      { value: 'usr2', label: 'User 2' },
      { value: 'usr3', label: 'User 3' }
    ]
  };

  constructor(private http: HttpClient) {}

  setConfig(config: FilterConfig) {
    this.config = config;
  }

  loadOptions(operand: FilterOperand, search: string = ''): Observable<FilterOption[]> {
    console.log('Loading options for:', operand.name, 'with search:', search);
    if (!operand.optionsConfig) {
      console.log('No options config found');
      return of([]);
    }

    // If static options are provided, filter them by search term
    if (operand.optionsConfig.staticOptions) {
      console.log('Using static options');
      const filtered = operand.optionsConfig.staticOptions.filter(opt => 
        opt.label.toLowerCase().includes(search.toLowerCase())
      );
      return of(filtered);
    }

    // Use mock data in development or when explicitly enabled
    if (!environment.production || environment.useMockData) {
      console.log('Using mock data');
      return this.getMockData(operand.optionsConfig.url, search);
    }

    // Handle API-based options
    const url = this.buildUrl(operand.optionsConfig.url);
    const method = operand.optionsConfig.method || this.config?.apiConfig?.defaultMethod || 'GET';
    const valueField = operand.optionsConfig.valueField || 'value';
    const labelField = operand.optionsConfig.labelField || 'label';
    const searchParam = operand.optionsConfig.searchParam || 'search';

    let params = new HttpParams();
    if (search && method === 'GET') {
      params = params.set(searchParam, search);
    }

    const headers = {
      ...this.config?.apiConfig?.headers,
      'X-User-Role': this.config?.apiConfig?.role || 'guest'
    };

    if (method === 'GET') {
      return this.http.get(url, { params, headers }).pipe(
        map((response: any) => this.mapResponseToOptions(response, valueField, labelField))
      );
    } else {
      const body = { [searchParam]: search };
      return this.http.post(url, body, { headers }).pipe(
        map((response: any) => this.mapResponseToOptions(response, valueField, labelField))
      );
    }
  }

  private buildUrl(path: string): string {
    const baseUrl = this.config?.apiConfig?.baseUrl || '';
    return `${baseUrl}${path}`.replace(/\/+/g, '/');
  }

  private mapResponseToOptions(response: any, valueField: string, labelField: string): FilterOption[] {
    if (Array.isArray(response)) {
      return response.map((item: any) => ({
        value: item[valueField],
        label: item[labelField]
      }));
    }
    // Handle nested response data
    if (response.data && Array.isArray(response.data)) {
      return response.data.map((item: any) => ({
        value: item[valueField],
        label: item[labelField]
      }));
    }
    return [];
  }

  private getMockData(url: string, search: string): Observable<FilterOption[]> {
    // Extract the entity type from the URL (e.g., '/api/divisions' -> 'divisions')
    const entity = url.split('/').pop() || '';
    console.log('Getting mock data for entity:', entity);
    
    // Get the mock data for this entity
    let data = this.mockData[entity as keyof typeof this.mockData] || [];
    console.log('Found mock data:', data);
    
    // Filter by search term
    if (search) {
      data = data.filter(item => 
        item.label.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Simulate network delay
    return new Observable(subscriber => {
      setTimeout(() => {
        subscriber.next(data);
        subscriber.complete();
      }, 2000); // 2 second delay
    });
  }
} 