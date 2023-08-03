import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch/dist/elasticsearch.module';
import * as Joi from '@hapi/joi';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      validationSchema: Joi.object({
        UPLOADED_FILES_DESTINATION: Joi.string().required(),
        // ...
      })
    }),
    ElasticsearchModule.register({
      node: 'http://localhost:9200',
    })
  ],
})
export class ConfigModule {}
