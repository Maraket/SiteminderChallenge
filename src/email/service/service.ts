import { Observable } from 'rxjs';
import { Email } from './email';

export interface EmailService {
    send(email: Email): Observable<null>;
}
