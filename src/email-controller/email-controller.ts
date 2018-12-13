import { Controller, Body, Post } from '@nestjs/common';
import { EmailManagerService } from '../email-manager/email-manager.service';
import { Email } from '../email/service/email';
import { Observable, of } from 'rxjs';

@Controller('email')
export class EmailController {
    constructor(readonly manager: EmailManagerService) {}

    @Post('send')
    sendEmail(@Body() email: Email): Observable<{status: string}> {
        return this.manager.sendEmail(email);
    }

    @Post('feedback')
    sendFeedback(): Observable<{status: string}> {
        return of({status: 'success'});
    }
}
