import { Test, TestingModule } from '@nestjs/testing';
import { EmailManagerService } from './email-manager.service';
import { MailgunService } from '../email/mailgun/mailgun.service';
import { SendgridService } from '../email/sendgrid/sendgrid.service';

describe('EmailManagerService', () => {
  let service: EmailManagerService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailManagerService, MailgunService, SendgridService],
    }).compile();
    service = module.get<EmailManagerService>(EmailManagerService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
