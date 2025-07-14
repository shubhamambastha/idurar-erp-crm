import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IntegrationController } from './integration.controller';
import { IntegrationService } from './integration.service';
import { DatabaseModule } from '../database/database.module';
import { Client, ClientSchema } from '../database/schemas/client.schema';
import { Invoice, InvoiceSchema } from '../database/schemas/invoice.schema';
import { Query, QuerySchema } from '../database/schemas/query.schema';
import { Payment, PaymentSchema } from '../database/schemas/payment.schema';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Client.name, schema: ClientSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Query.name, schema: QuerySchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  controllers: [IntegrationController],
  providers: [IntegrationService],
})
export class IntegrationModule {}
