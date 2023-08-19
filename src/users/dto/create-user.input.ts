import { Order } from "src/order-app/entities/order.entity";

export class CreateUserDTO {
  authToken: string
  firstName?: string;
  lastName?: string;
  phone: string;
  neighbourhood?: string;
  city: string;
  role: string;
  accountType: string;
  specialization: string;
  searchTerm: string;
  department: string;
  jobRole: string;
  deploymentStatus: string;
  streetAddress: string;
}                  

export class MessageDTO {
  content: string;
  senderID: string;
  recieverID: string;
  senderPhone: string;
  recieverPhone: string;
}


export class PlaceOrderSocketDTO {
  order: Order;
  clientID: string;
  clientPhone: string;
  vendorPhone: string;
  vendorID: string;
}