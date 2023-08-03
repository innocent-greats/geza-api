
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Order } from './order.entity';


@Entity()
export class OfferItem {
  @PrimaryGeneratedColumn('uuid')
  itemID :  string;
  
  @CreateDateColumn()
  createdDate: Date;
  
  @UpdateDateColumn()
  updatedDate: Date;
  
  @DeleteDateColumn()
  deletedDate: Date;
  @Column({nullable: true})
  itemName:string 
  @Column({nullable: true})
  itemCategory:string 
  @Column({nullable: true})
  vendorID :  string;
  @Column({nullable: true})
  clientID : string;
  @Column({nullable: true})
  offeringStatus : string; 
  @Column({nullable: true})
  quantity : string;
  @Column({nullable: true})
  minimumPrice : string;
  @ManyToOne(() => User, (vendor: User) => vendor.OfferItems)
  public vendor: User;
  @OneToMany(() => Order, (order: Order) => order.offerItem)
  public orders: Order[];
  @OneToMany(() => OfferItemImage, (image: OfferItemImage) => image.offerItem)
  public images: OfferItemImage[];
}
 

@Entity()
export class OfferItemImage {
  @PrimaryGeneratedColumn('uuid')
  imageID :  string;
  @Column({nullable: true})
  url :  string;
  @ManyToOne(() => OfferItem, (offerItem: OfferItem) => offerItem.images)
  public offerItem: OfferItem;
}