import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule, ElasticsearchModuleOptions, ElasticsearchOptionsFactory } from '@nestjs/elasticsearch';
import OfferItemsSearchService from './search.service';
import SearchService from './search.service';
import fs = require('fs');
import path = require('path');

// console.log('current dir',dirname)
@Module({
  imports: [
    ConfigModule,
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get('ELASTICSEARCH_NODE'),
        auth: { 
          username: configService.get('ELASTICSEARCH_USERNAME'),
          password: configService.get('ELASTICSEARCH_PASSWORD'),
        },
        tls: {
          ca: configService.get('CA_CERTIFICATE'),
          rejectUnauthorized: false
        }
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [ElasticsearchModule]
})
@Module({
  imports: [SearchService],
  controllers: [],
  providers: [SearchService, ],
})
export class SearchModule implements OnModuleInit  {
    constructor(private readonly searchService: OfferItemsSearchService){}
    public async onModuleInit() {
       await this.searchService.createIndex();
    }
  }