import { Test, TestingModule } from '@nestjs/testing';
import { SendgridService } from './sendgrid.service';
import { BadRequestException } from '@nestjs/common';

describe('SendgridService', () => {
  let service: SendgridService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SendgridService],
    }).compile();
    service = module.get<SendgridService>(SendgridService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should require minimum fields', (done) => {
    service.send({} as any).subscribe(() => done.fail(), (err) => {
      expect(err).toBeInstanceOf(BadRequestException);
      done();
    });
  });
});
