import { Module } from '@nestjs/common';
import { BlogModule } from '../blog/blog.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [BlogModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
