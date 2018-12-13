import { Injectable, InternalServerErrorException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { EmailService } from '../service/service';
import { Email } from '../service/email';
import { Observable, of, from } from 'rxjs';
import { flatMap, catchError } from 'rxjs/operators';
import Axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import * as _ from 'lodash';
import { Sendgrid } from './sendgrid.request';

const SEND: string = 'send';

@Injectable()
export class SendgridService implements EmailService {

    sender: AxiosInstance;

    constructor() {
        this.sender = Axios.create({
            baseURL: process.env.SENDGRID_URL,
            headers: {
                Authorization: `Bearer ${process.env.SENDGRID_KEY}`,
            },
        });
    }

    send(email: Email): Observable<null> {
        if (!email.from || !email.subject || !email.text || !email.to) {
            return new Observable((observer) => observer.error(new BadRequestException()));
        }
        return from(this.sender.post<any>(SEND, this.convertEmailtoRequest(email))).pipe(
            flatMap((resp: AxiosResponse<any>) => {
                // Based off of https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/errors.html
                switch (resp.status) {
                    case 200:
                    case 202:
                        return of(null);
                    default:
                        throw new InternalServerErrorException();
                }
            }),
            catchError((err: AxiosError) => {
                if (!err.response) {
                    throw new InternalServerErrorException('Unexpected error');
                }
                switch (err.response.status) {
                    // The below status' mean this isn't going to be immediately recoverable, and will notify upstream that
                    // this is the case, and maybe taken out of circulation for a period
                    case 401:
                    case 403:
                    case 404:
                    case 405:
                        throw new ForbiddenException();
                    // Maybe recoverable
                    case 400:
                    case 413:
                    case 415:
                    case 429:
                        throw new  BadRequestException();
                    // This is likely 5xx and so maybe recoverable but special handling may be needed
                    default:
                        throw new InternalServerErrorException();
                }
            }),
        );
    }

    private normalizeEmailString(emailString: string): Sendgrid.Email {
        if (!emailString) {
            throw new BadRequestException();
        }

        // This is a lazy way of doing the normalization, a better way would be to use something like a regex, and remove
        // but for demo purposes it should be ok
        const fields: string[] = emailString.split('<');

        // We're assuming if there is more then 1 < it's a bad string but see above
        if (fields.length > 2) {
            throw new BadRequestException();
        }

        if (fields.length === 1) {
            return {
                email: fields[0].trim(),
            };
        }

        return {
            email: fields[1].replace(/\<|\>|\;|\,/g, ''),
            name: fields[0].trim(),
        };
    }

    private convertEmailtoRequest(email: Email): Sendgrid.Request {
        const personalizations: Sendgrid.Personalization[] = [];

        const to: Sendgrid.Email[] = _.map(email.to, (emailString) => this.normalizeEmailString(emailString));
        const cc: Sendgrid.Email[] = _.map(email.cc, (emailString) => this.normalizeEmailString(emailString));
        const bcc: Sendgrid.Email[] = _.map(email.bcc, (emailString) => this.normalizeEmailString(emailString));

        const personalization: Sendgrid.Personalization = {to};
        if (cc.length > 0) {
            personalization.cc = cc;
        }
        if (bcc.length > 0) {
            personalization.bcc = bcc;
        }

        personalizations.push(personalization);

        const fromEmail: Sendgrid.Email = this.normalizeEmailString(email.from);
        const subject: string = email.subject;
        const value: string = email.text;

        return {
            personalizations,
            from: fromEmail,
            subject,
            content: [{
                type: 'text/plain',
                value,
            }],
        };
    }
}
