import { Module } from '@nestjs/common';
import { SendgridService } from './sendgrid/sendgrid.service';
import { MailgunService } from './mailgun/mailgun.service';

@Module({
  providers: [SendgridService, MailgunService],
  exports: [SendgridService, MailgunService],
})
export class EmailModule {}
