import { Injectable, ForbiddenException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { EmailService } from '../service/service';
import { Email } from '../service/email';
import { Observable, from, of } from 'rxjs';
import { flatMap, catchError } from 'rxjs/operators';
import Axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { Mailgun } from './mailgun.request';
import * as FormData from 'form-data';

const SEND: string = 'messages';

@Injectable()
export class MailgunService implements EmailService {

    sender: AxiosInstance;

    constructor() {
        this.sender = Axios.create({
            baseURL: process.env.MAILGUN_URL,
            auth: {
                username: 'api',
                password: process.env.MAILGUN_KEY,
            },
        });
    }

    private requestToForm(request: Mailgun.Request): string {
        /*
        const form = new FormData();

        Object.keys(request).forEach((field: string) => {
            if (Array.isArray(request[field])) {
                request[field].forEach((val) => form.append(field, val));
            } else if (request[field]) {
                form.append(field, request[field]);
            }
        });

        return form;
        */

        let output = '';

        Object.keys(request).forEach((field: string) => {
            if (Array.isArray(request[field])) {
                request[field].forEach((val) => output += `${field}=${val}&`);
            } else if (request[field]) {
                output += `${field}=${request[field]}&`;
            }
        });

        return encodeURI(output);
    }

    send(email: Email): Observable<null> {
        if (!email.from || !email.subject || !email.text || !email.to) {
            return new Observable((observer) => observer.error(new BadRequestException()));
        }
        // This is more just to use an object, and also allows for some extensibility, like additional fields
        const request: Mailgun.Request = {
            from: email.from,
            to: email.to,
            subject: email.subject,
            cc: email.cc,
            bcc: email.bcc,
            text: email.text,
        };

        return from(this.sender.post(SEND, this.requestToForm(request))).pipe(
            flatMap((resp: AxiosResponse<any>) => {
                // Based off of https://documentation.mailgun.com/en/latest/api-intro.html#errors
                switch (resp.status) {
                    case 200:
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
                    case 404:
                        throw new ForbiddenException();
                    // Maybe recoverable
                    case 400:
                    case 402:
                        throw new  BadRequestException();
                    // This is likely 5xx and so maybe recoverable but special handling may be needed
                    default:
                        throw new InternalServerErrorException();
                }
            }),
        );
    }
}
