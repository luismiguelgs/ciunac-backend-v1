import { Module, forwardRef } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ConstanciasModule } from 'src/modules/administrativas/constancias/constancias.module';

@Module({
  imports: [forwardRef(() => ConstanciasModule)],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
