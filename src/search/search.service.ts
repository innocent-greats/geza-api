import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { OfferItem } from 'src/order-app/entities/offer-item.entity';
import { OfferItemSearchResult, OfferItemSearchBody } from 'src/order-app/types/offerItemSearchBody.interface';


 
@Injectable()
export default class SearchService {
  index = 'items'
 
  constructor(
    private readonly elasticsearchService: ElasticsearchService, 
    private readonly configService: ConfigService
  ) {}
 
  public async createIndex() {
    const index = 'items'
    const checkIndex = await this.elasticsearchService.indices.exists({ index });
    // tslint:disable-next-line:early-exit
    if (checkIndex === false) {
      this.elasticsearchService.indices.create(
        {
          index,
          body: {
            mappings: {
              properties: {
                itemName: {
                  type: 'text',
                  analyzer: "edge_ngram_analyzer",
                  fields: {
                    keyword: {
                      type: 'keyword',
                      ignore_above: 256,
                    },
                  },
                },
                itemCategory: {
                      type: 'text',
                      analyzer: "edge_ngram_analyzer",
                      fields: {
                        keyword: {
                          type: 'keyword',
                          ignore_above: 256,
                        },
                  },
                },
                neighbourhood: {
                  type: 'text',
                  analyzer: "edge_ngram_analyzer",
                  fields: {
                    keyword: {
                      type: 'keyword',
                      ignore_above: 256,
                    },
                  },
                },
                city: {
                  type: 'text',
                  analyzer: "edge_ngram_analyzer",
                  fields: {
                    keyword: {
                      type: 'keyword',
                      ignore_above: 256,
                    },
                  },
                },
              },
            },
            settings: {
              analysis: {
                filter: {
                  autocomplete_filter: {
                    type: 'edge_ngram',
                    min_gram: 1,
                    max_gram: 20,
                  },
                },
                analyzer: {
                  edge_ngram_analyzer: {
                    type: "custom",
                    tokenizer: "edge_ngram_tokenizer"
                  },
                  autocomplete: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'autocomplete_filter'],
                  },
                },
                tokenizer: {
                  edge_ngram_tokenizer: {
                    type: "edge_ngram",
                    min_gram: 2,
                    max_gram: 10,
                    token_chars: [
                      "letter",
                      "digit"
                    ]
                  }
                }
              },
            },
          },
        },
      );
    }
  }
  async indexOfferItem(offerItem: OfferItem) {
    return this.elasticsearchService.index<OfferItemSearchBody>({
      index: this.index,
      body: {
        itemID: offerItem.itemID,
        itemName: offerItem.itemName,
        itemCategory: offerItem.itemCategory,
        vendorID: offerItem.vendor.userID,
        city: offerItem.vendor.city,
        neighbourhood: offerItem.vendor.neighbourhood
      }
    })
  }
 
  async search(text: any) {
    console.log('searchFor OfferItems textis',text)

    const body = await this.elasticsearchService.search<OfferItemSearchResult>({
      index: this.index,
      body: {
        query: {
          bool: {
             should: [
                {
                   multi_match: {
                      query: text,
                      fields: ['itemName', 'itemCategory', 'city','neighbourhood'],
                      boost: 2
                   }
                },
                {
                   multi_match: {
                      query: text,
                      fields: ['itemName', 'itemCategory', 'city','neighbourhood'],
                      boost: 1
                   }
                }
             ]
          }
       }
      }
    })
    console.log(body)
    const hits = body.hits.hits;
    const res = hits.map((item) => item._source);
    console.log('res', res)
    return res;
  }
}