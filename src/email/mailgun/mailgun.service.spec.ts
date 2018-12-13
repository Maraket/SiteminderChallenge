import { Test, TestingModule } from '@nestjs/testing';
import { MailgunService } from './mailgun.service';
import { BadRequestException } from '@nestjs/common';

describe('MailgunService', () => {
  let service: MailgunService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailgunService],
    }).compile();
    service = module.get<MailgunService>(MailgunService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should require a from field', (done) => {
    service.send({} as any).subscribe(() => done.fail(), (err) => {
      expect(err).toBeInstanceOf(BadRequestException);
      done();
    });
  });
});
