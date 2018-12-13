export namespace Mailgun {
    export interface Request {
        to: string[];
        cc: string[];
        bcc: string[];
        from: string;
        subject: string;
        text: string;
    }
}
