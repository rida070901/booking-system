import { HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "../services/auth.service";
import { environment } from "../../../environments/environment";


export function authInterceptor(request: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {

  const authService = inject(AuthService);
  const token = authService.getToken();
  const baseUrl = environment.apiUrl;

  //public endpoints dont need authorization (available for guests)
  const publicEndpoints = [
    `${baseUrl}${environment.endpoints.auth.login}`,
    `${baseUrl}${environment.endpoints.auth.register}`,
    `${baseUrl}${environment.endpoints.guestHouse.getAll}`,
    `${baseUrl}${environment.endpoints.guestHouse.topFive}`,
  ];
  const publicGetPatterns = [
    `${baseUrl}/GuestHouse/`, // matches /GuestHouse/{id}
    `${baseUrl}/Room/GuestHouse/`, // matches /Room/GuestHouse/{id}
    `${baseUrl}/Room/` // matches /Room/{id}
  ];

  const urlWithoutParams = request.url.split('?')[0];

  const isPublic = request.method === 'GET' &&
    (publicEndpoints.includes(urlWithoutParams) ||
      publicGetPatterns.some(url => urlWithoutParams.startsWith(url)));

  if(!isPublic && token) {
    request = request.clone({
      setHeaders: {
        // 'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
  } else if (isPublic) {
    console.log('public request', request.url);
  }

  return next(request);

}
