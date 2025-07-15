import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({
  timestamps: true,
  collection: 'payments',
})
export class Payment {
  @Prop({ required: true, unique: true })
  number: number;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Client', required: true })
  client: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Invoice', required: true })
  invoice: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Admin', required: true })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop()
  paymentMode: string;

  @Prop()
  ref: string;

  @Prop()
  description: string;

  @Prop({ default: false })
  removed: boolean;

  @Prop({ default: true })
  enabled: boolean;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
