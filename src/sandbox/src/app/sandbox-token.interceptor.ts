import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class SandboxTokenInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWQyZmZmNGItYzkwYi00YTIxLWJmZGMtZjZjMGU3ZWViNjIyIiwiZW1haWwiOiJ0ZXN0Y2FzZXNAcGF5ZXZlci5kZSIsImZpcnN0TmFtZSI6IlRlc3QiLCJsYXN0TmFtZSI6IlRlc3QiLCJyb2xlcyI6W3sicGVybWlzc2lvbnMiOltdLCJ0YWdzIjpbXSwibmFtZSI6Im1lcmNoYW50In0seyJwZXJtaXNzaW9ucyI6W10sInRhZ3MiOltdLCJuYW1lIjoibWVyY2hhbnQiLCJ0eXBlIjoibWVyY2hhbnQifV0sInRva2VuSWQiOiIyMzE2M2U4Ny02NTdiLTQ4YzUtODY3YS1iY2ZlNjVlZDQ3MmQiLCJ0b2tlblR5cGUiOjAsImNsaWVudElkIjpudWxsLCJoYXNoIjoiZWRjZjJkYTk2NmIzYTQ0ZjBjYzllYjQ1NDUxZmM0MTI1NGIyZTRkMmM3NDQ0MTJlNGQ3MmY0YmY4ZGI2M2ZjYiJ9LCJpYXQiOjE1OTk3MzQ5MzksImV4cCI6MTU5OTgyMTMzOX0.aamuugDihWSW3aCLnSe7T3LLPMcUTYFxFEpjhW20Vck';
    if (token) {
      return next.handle(req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      }));
    }

    return next.handle(req);
  }
}
