import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type InvoiceDocument = Invoice &
  Document & {
    createdAt: Date;
    updatedAt: Date;
    client: {
      _id: MongooseSchema.Types.ObjectId;
      name: string;
      email: string;
    };
  };

@Schema({
  timestamps: true,
  collection: 'invoices',
})
export class Invoice {
  @Prop({ required: true, unique: true })
  number: number;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  expiredDate: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Client', required: true })
  client: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Admin', required: true })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop([
    {
      itemName: { type: String, required: true },
      description: String,
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      total: { type: Number, required: true },
    },
  ])
  items: Array<{
    itemName: string;
    description?: string;
    quantity: number;
    price: number;
    total: number;
  }>;

  @Prop({ default: 0 })
  taxRate: number;

  @Prop({ required: true })
  subTotal: number;

  @Prop({ required: true })
  total: number;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({
    enum: ['unpaid', 'paid', 'partially'],
    default: 'unpaid',
  })
  paymentStatus: string;

  @Prop({
    enum: ['draft', 'pending', 'sent', 'refunded', 'cancelled', 'on hold'],
    default: 'draft',
  })
  status: string;

  @Prop({ default: false })
  removed: boolean;

  @Prop({ default: true })
  enabled: boolean;

  @Prop()
  note: string;

  @Prop()
  notesSummary: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
