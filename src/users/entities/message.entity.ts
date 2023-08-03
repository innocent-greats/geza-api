
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
class Message {
    @PrimaryGeneratedColumn('uuid')
    messageID: string;
    @CreateDateColumn()
    createdDate: Date;
    @UpdateDateColumn()
    updatedDate: Date;
    @DeleteDateColumn()
    deletedDate: Date;
    @Column({ nullable: true })
    public content: string;
    @Column({ nullable: true })
    public senderID: string;
    @Column({ nullable: true })
    public recieverID: string;
}

export default Message;

@Entity()
export class OTP {
    @PrimaryGeneratedColumn('uuid')
    otpID: string;
    @CreateDateColumn()
    createdDate: Date;
    @UpdateDateColumn()
    updatedDate: Date;
    @DeleteDateColumn()
    deletedDate: Date;
    @Column()
    public phone: string;
    @Column()
    public otp: string;
}