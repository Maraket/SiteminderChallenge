import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailgunService } from '../email/mailgun/mailgun.service';
import { SendgridService } from '../email/sendgrid/sendgrid.service';
import { Email } from '../email/service/email';
import { Observable, from, of } from 'rxjs';
import { EmailService } from '../email/service/service';
import { flatMap, catchError, skipWhile } from 'rxjs/operators';

@Injectable()
export class EmailManagerService {
    services: EmailService[] = [];

    /*
        I would probably in a production environment scan all loaded services for ones that implement
        the service interface under email/service/service.ts and create a container service to simplify
        adding more mail servers
    */
    constructor(readonly mailgun: MailgunService, readonly sendgrid: SendgridService) {
        this.services.push(mailgun);
        this.services.push(sendgrid);
    }

    sendEmail(email: Email, idx: number = 0): Observable<{status: string}> {
        return this.services[idx].send(email).pipe(
             flatMap(() => {
                return of({
                    status: 'successful',
                });
            }), catchError(() => {
                // Could implement logic to remove or send a notification that a failure occured and
                // justify what action should be taken

                if (idx === this.services.length - 1) {
                   throw new InternalServerErrorException('We were unable to send the email');
                }

                return this.sendEmail(email, ++idx);
            }),
        );
    }
}
