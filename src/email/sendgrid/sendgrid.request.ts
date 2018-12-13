/*
    Simplified version of https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/index.html
    Doesn't include all options or fields
*/
export namespace Sendgrid {
    export interface Email {
        email: string;
        name?: string;
    }

    export interface Personalization {
        to: Email[];
        cc?: Email[];
        bcc?: Email[];
        subject?: string;
    }

    export interface Content {
        type: 'text/plain';
        value: string;
    }

    export interface Request {
        personalizations: Personalization[];
        from: Email;
        subject: string;
        content: Content[];
    }
}
