import { Controller, Post, UploadedFile, UploadedFiles, UseInterceptors, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file để upload');
    }

    try {
      const result = await this.uploadService.uploadFile(file);
      return {
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
      };
    } catch (error) {
      throw new BadRequestException('Upload thất bại: ' + error.message);
    }
  }

  @Post('images')
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  async uploadMultipleImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất 1 file');
    }

    try {
      const uploadPromises = files.map((file) => this.uploadService.uploadFile(file));
      const results = await Promise.all(uploadPromises);
      
      return results.map(result => ({
        url: result.secure_url,
        public_id: result.public_id,
      }));
    } catch (error) {
      throw new BadRequestException('Upload nhiều file thất bại: ' + error.message);
    }
  }
}
