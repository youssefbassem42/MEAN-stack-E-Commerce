import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly httpClient = inject(HttpClient);

  public get<T>(path: string, options?: object): Observable<T> {
    return this.httpClient.get<T>(path, options);
  }

  public post<T>(path: string, body: unknown, options?: object): Observable<T> {
    return this.httpClient.post<T>(path, body, options);
  }

  public put<T>(path: string, body: unknown, options?: object): Observable<T> {
    return this.httpClient.put<T>(path, body, options);
  }

  public delete<T>(path: string, options?: object): Observable<T> {
    return this.httpClient.delete<T>(path, options);
  }
}
