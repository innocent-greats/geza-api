export interface OfferItemSearchBody {
    itemID: string,
    itemName: string,
    itemCategory: string,
    city: string,
    neighbourhood: string,
    vendorID: string
  }

export interface OfferItemSearchResult {
    hits: {
      total: number;
      hits: Array<{
        _source: OfferItemSearchBody;
      }>;
    };
  }