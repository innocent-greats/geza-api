import { PartialType } from '@nestjs/mapped-types';


export class UpdateUserInput{
  firstName?: string;
  lastName?: string;
  phone?: string;
  neighbourhood?: string;
  city?: string;
  accountType?: string;
  specialization?: string;
  searchTerm?: string;
}
