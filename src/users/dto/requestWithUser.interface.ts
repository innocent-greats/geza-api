
import { Request } from 'express';
import { User } from '../entities/user.entity';
 
interface RequestWithUser extends Request {
  user: User;
}
 
export interface RequestWithOfferItem extends Request {
  user: User;
  host: string;
  cookie: string;
  offeritem: User;
}
export default RequestWithUser;