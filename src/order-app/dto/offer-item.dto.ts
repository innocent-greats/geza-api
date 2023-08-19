export class OfferItemDTO {
  itemName: string
  itemCategory: string
  vendorID: string;
  offeringStatus: string;
  quantity: string;
  minimumPrice: string;
  description: string;
  trendingStatus: string;
  publishStatus: string;
}
export class OfferItemRequestDTO {
  authToken: string
  itemName: string
  itemCategory: string
  vendorID: string;
  offeringStatus: string;
  quantity: string;
  minimumPrice: string;
  description: string;
  trendingStatus: string;
  publishStatus: string;
}
export class OfferItemImage {
  imageID: string;
  url: string;
}