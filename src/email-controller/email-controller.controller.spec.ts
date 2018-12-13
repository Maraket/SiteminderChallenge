import { Test, TestingModule } from '@nestjs/testing';
import { EmailController } from './email-controller';
import { EmailManagerService } from '../email-manager/email-manager.service';
import { MailgunService } from '../email/mailgun/mailgun.service';
import { SendgridService } from '../email/sendgrid/sendgrid.service';

describe('EmailController', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [EmailManagerService, MailgunService, SendgridService],
    }).compile();
  });
  it('should be defined', () => {
    const controller: EmailController = module.get<EmailController>(EmailController);
    expect(controller).toBeDefined();
  });
});
