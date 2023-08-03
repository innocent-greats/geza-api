import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from '@nestjs/class-transformer';
import { OfferItem } from '../../order-app/entities/offer-item.entity';
import { Order } from 'src/order-app/entities/order.entity';
import PublicFile from 'src/files/localFile.entity';
import LocalFile from 'src/files/localFile.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  userID: string;

  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
  @Column({ nullable: true })
  firstName?: string;
  @Column({ nullable: true })
  lastName?: string;
  @Column({ nullable: true })
  phone: string;
  @Column({ nullable: true })
  @Exclude()
  public password: string;
  @Column({ nullable: true })
  email?: string;
  @Column({ nullable: true })
  role: string;
  @Column({ nullable: true })
  profileImage: string;
  @Column({ nullable: true })
  city: string;
  @Column({ nullable: true })
  neighbourhood: string;
  @Column({ nullable: true })
  accountType: string;
  @Column({ nullable: true })
  specialization: string;
  @Column({ nullable: true })
  onlineStatus: boolean;
  @Column({ nullable: true })
  searchTerm: string;
  @OneToMany(() => OfferItem, (offerItem: OfferItem) => offerItem.vendor)
  public OfferItems: OfferItem[];
  @OneToMany(() => OfferItem, (offerItem: OfferItem) => offerItem.vendor)
  public orders: Order[];
  @JoinColumn({ name: 'avatarId' })
  @OneToOne(
    () => LocalFile,
    {
      nullable: true
    }
  )
  public avatar?: LocalFile;
 
  @Column({ nullable: true })
  public avatarId?: string;
}


