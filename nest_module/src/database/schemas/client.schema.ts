import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ClientDocument = Client &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };

@Schema({
  timestamps: true,
  collection: 'clients',
})
export class Client {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  phone: string;

  @Prop({ trim: true })
  country: string;

  @Prop({ trim: true })
  address: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Admin' })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Admin' })
  assigned: MongooseSchema.Types.ObjectId;

  @Prop({ default: false })
  removed: boolean;

  @Prop({ default: true })
  enabled: boolean;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
