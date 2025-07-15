import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type QueryDocument = Query &
  Document & {
    createdAt: Date;
    updatedAt: Date;
    customer: {
      _id: MongooseSchema.Types.ObjectId;
      name: string;
      email: string;
    };
  };

@Schema({
  timestamps: true,
  collection: 'queries',
})
export class Query {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Client', required: true })
  customer: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  description: string;

  @Prop({
    enum: ['Open', 'InProgress', 'Closed'],
    default: 'Open',
  })
  status: string;

  @Prop()
  resolution: string;

  @Prop([
    {
      note: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ])
  notes: Array<{
    note: string;
    createdAt: Date;
  }>;

  @Prop({ default: false })
  removed: boolean;

  @Prop({ default: true })
  enabled: boolean;
}

export const QuerySchema = SchemaFactory.createForClass(Query);
