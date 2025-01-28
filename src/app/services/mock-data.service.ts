import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private divisions = [
    'Engineering',
    'Sales',
    'Marketing',
    'Finance',
    'Human Resources',
    'Operations',
    'Research & Development',
    'Customer Support',
    'Legal',
    'Product Management'
  ];

  private costCenters = [
    { id: 'CC001', name: 'Engineering - Core' },
    { id: 'CC002', name: 'Engineering - Platform' },
    { id: 'CC003', name: 'Sales - North America' },
    { id: 'CC004', name: 'Sales - Europe' },
    { id: 'CC005', name: 'Marketing - Digital' },
    { id: 'CC006', name: 'Marketing - Events' },
    { id: 'CC007', name: 'Finance - Accounting' },
    { id: 'CC008', name: 'HR - Recruitment' },
    { id: 'CC009', name: 'Operations - APAC' },
    { id: 'CC010', name: 'R&D - Innovation Lab' }
  ];

  private locations = [
    'New York, USA',
    'London, UK',
    'Singapore',
    'Sydney, Australia',
    'Toronto, Canada',
    'Berlin, Germany',
    'Tokyo, Japan',
    'Paris, France',
    'Mumbai, India',
    'São Paulo, Brazil'
  ];

  private managers = [
    'John Smith',
    'Emma Johnson',
    'Michael Chen',
    'Sarah Williams',
    'David Brown',
    'Lisa Anderson',
    'James Wilson',
    'Maria Garcia',
    'Robert Taylor',
    'Jennifer Martinez'
  ];

  getDivisions(search: string = ''): Observable<string[]> {
    const filtered = this.divisions.filter(div => 
      div.toLowerCase().includes(search.toLowerCase())
    );
    return of(filtered).pipe(delay(300)); // Simulate network delay
  }

  getCostCenters(search: string = ''): Observable<Array<{id: string, name: string}>> {
    const filtered = this.costCenters.filter(cc => 
      cc.name.toLowerCase().includes(search.toLowerCase()) ||
      cc.id.toLowerCase().includes(search.toLowerCase())
    );
    return of(filtered).pipe(delay(300));
  }

  getLocations(search: string = ''): Observable<string[]> {
    const filtered = this.locations.filter(loc => 
      loc.toLowerCase().includes(search.toLowerCase())
    );
    return of(filtered).pipe(delay(300));
  }

  getManagers(search: string = ''): Observable<string[]> {
    const filtered = this.managers.filter(manager => 
      manager.toLowerCase().includes(search.toLowerCase())
    );
    return of(filtered).pipe(delay(300));
  }
} 