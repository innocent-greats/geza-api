import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import {OfferItem} from "./offer-item.entity";
  
@Entity()
export class Order {
    @PrimaryGeneratedColumn('uuid')
    orderID :  string;
    @CreateDateColumn()
    orderDate: string;
    @CreateDateColumn()
    createdDate: Date;
    @UpdateDateColumn()
    updatedDate: Date;
    @DeleteDateColumn()
    deletedDate: Date;
    @Column({nullable: true})
    bookedServiceDate: Date;
    @Column({nullable: true})
    orderTrackerHash :  string;
    @Column({nullable: true})
    orderStatus : string; // service specific status 
    @Column({nullable: true})
    quantity : number;
    @Column({nullable: true})
    totalAmount : number;
    @Column({nullable: true}) 
    updatedStatus: string
    @ManyToOne(() => User, (vendor: User) => vendor.orders)
    vendor: User;
    @ManyToOne(() => User, (vendor: User) => vendor.orders)
    customer: User;
    @ManyToOne(() => OfferItem, (offerItem: OfferItem) => offerItem.orders)
    offerItem: OfferItem;
}