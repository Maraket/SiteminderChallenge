import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { EmailController } from './email-controller/email-controller';
import { EmailManagerService } from './email-manager/email-manager.service';

@Module({
  imports: [EmailModule],
  controllers: [EmailController],
  providers: [EmailManagerService],
})
export class AppModule {}
