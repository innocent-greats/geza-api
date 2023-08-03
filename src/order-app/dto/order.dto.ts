export class OrderDTO {
    orderTrackerHash :  string;
    orderStatus : string; // service specific status 
    quantity : number;
    totalAmount : number; 
    updatedStatus: string
}

