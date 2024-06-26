import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {Router} from "@angular/router";
import jwtDecode from 'jwt-decode';
import { DecodedToken } from './decoded-token.model';
import jwt_decode from "jwt-decode";


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = 'http://localhost:8080/api/auth/login';

  constructor(private http: HttpClient, private router:Router) { }

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<{jwt: string}>(this.authUrl, {username, password})
      .pipe(
        map(response => {
          localStorage.setItem('Authorization', response.jwt);
          return true;
        }),
        catchError(error => {
          console.error('Login error:', error);
          return of(false);
        })
      );
  }
  getTokenPayload(): DecodedToken | null {
    const token = localStorage.getItem('Authorization');
    if (!token) return null;
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
  }

  isAdmin(): boolean {
    const payload = this.getTokenPayload();
    return payload?.Role === 'ADMIN';
  }
  getToken(): string | null {
    return localStorage.getItem('Authorization');
  }

  logout(): void {
    localStorage.removeItem('Authorization');
    this.router.navigate(['/login']);
  }
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (token) {
      const decodedToken: any = jwt_decode(token);
      const expiryTime = decodedToken.exp * 30* 60 * 1000;
      return Date.now() < expiryTime;
    }
    return false;
  }

  getReceptionistId() {
    const payload = this.getTokenPayload();
    return payload?.ID_Recepcionera;
  }
}
