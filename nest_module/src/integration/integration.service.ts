import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WebhookPayload,
  ReportsSummaryResponse,
} from './integration.controller';
import { Client, ClientDocument } from '../database/schemas/client.schema';
import { Invoice, InvoiceDocument } from '../database/schemas/invoice.schema';
import { Query, QueryDocument } from '../database/schemas/query.schema';
import { Payment, PaymentDocument } from '../database/schemas/payment.schema';

@Injectable()
export class IntegrationService {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Query.name) private queryModel: Model<QueryDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}
  async generateReportsSummary(): Promise<ReportsSummaryResponse> {
    const [customersData, invoicesData, queriesData, paymentsData] =
      await Promise.all([
        this.getCustomersData(),
        this.getInvoicesData(),
        this.getQueriesData(),
        this.getPaymentsData(),
      ]);

    return {
      customers: customersData,
      invoices: invoicesData,
      queries: queriesData,
      payments: paymentsData,
    };
  }

  async processWebhook(payload: WebhookPayload): Promise<unknown> {
    const processedPayload = {
      ...payload,
      receivedAt: new Date().toISOString(),
      processed: true,
    };

    switch (payload.type) {
      case 'sales_lead':
        return this.processSalesLead(payload.data);
      case 'payment_notification':
        return this.processPaymentNotification(payload.data);
      case 'customer_update':
        return this.processCustomerUpdate(payload.data);
      default:
        return {
          message: 'Unknown webhook type processed',
          originalPayload: processedPayload,
        };
    }
  }

  async getCustomerAnalytics(): Promise<{
    demographics: Record<string, unknown>;
    topCustomersByRevenue: unknown[];
    recentActivity: unknown[];
  }> {
    const totalCustomers = await this.clientModel.countDocuments({
      removed: false,
    });
    const currentMonth = new Date();
    currentMonth.setDate(1);

    const newThisMonth = await this.clientModel.countDocuments({
      removed: false,
      createdAt: { $gte: currentMonth },
    });

    const topCountries = await this.clientModel.aggregate([
      { $match: { removed: false } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { country: '$_id', count: 1, _id: 0 } },
    ]);

    const topCustomersByRevenue = await this.invoiceModel.aggregate([
      { $match: { removed: false, paymentStatus: 'paid' } },
      { $group: { _id: '$client', totalRevenue: { $sum: '$total' } } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'client',
        },
      },
      { $unwind: '$client' },
      {
        $project: {
          customerId: '$_id',
          name: '$client.name',
          revenue: '$totalRevenue',
        },
      },
    ]);

    const recentActivity = await this.invoiceModel
      .find({ removed: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('client', 'name')
      .select('client createdAt')
      .exec();

    return {
      demographics: {
        totalCustomers,
        newThisMonth,
        churnRate: 2.3,
        averageLifetimeValue: 8500,
        topCountries,
      },
      topCustomersByRevenue,
      recentActivity: recentActivity.map((invoice) => ({
        customerId: invoice.client._id,
        customerName: invoice.client.name,
        action: 'invoice_created',
        timestamp: invoice.createdAt,
      })),
    };
  }

  async getInvoiceMetrics(): Promise<{
    monthlyTrends: unknown[];
    statusDistribution: Record<string, number>;
    averageInvoiceValue: number;
    overdueInvoices: unknown[];
  }> {
    const monthlyTrends = await this.invoiceModel.aggregate([
      { $match: { removed: false } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: '$total' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
      {
        $project: {
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: '$_id.month' },
            ],
          },
          totalInvoices: 1,
          totalAmount: 1,
          _id: 0,
        },
      },
    ]);

    const statusDistribution = await this.invoiceModel.aggregate([
      { $match: { removed: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusDistributionObj = statusDistribution.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const avgResult = await this.invoiceModel.aggregate([
      { $match: { removed: false } },
      { $group: { _id: null, avgValue: { $avg: '$total' } } },
    ]);

    const averageInvoiceValue = avgResult[0]?.avgValue || 0;

    const overdueInvoices = await this.invoiceModel
      .find({
        removed: false,
        expiredDate: { $lt: new Date() },
        paymentStatus: { $ne: 'paid' },
      })
      .populate('client', 'name')
      .select('number total expiredDate client')
      .limit(10)
      .exec();

    return {
      monthlyTrends,
      statusDistribution: statusDistributionObj,
      averageInvoiceValue,
      overdueInvoices: overdueInvoices.map((invoice) => ({
        invoiceId: invoice._id,
        invoiceNumber: invoice.number,
        clientName: invoice.client.name,
        amount: invoice.total,
        daysPastDue: Math.floor(
          (new Date().getTime() - invoice.expiredDate.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      })),
    };
  }

  async transformData(transformationRequest: {
    sourceType: 'customers' | 'invoices' | 'queries';
    transformationType: 'export' | 'aggregate' | 'normalize';
    filters?: Record<string, unknown>;
    format?: 'json' | 'csv' | 'xml';
  }): Promise<{
    transformedData: unknown;
    recordCount: number;
    format: string;
  }> {
    const {
      sourceType,
      transformationType,
      format = 'json',
    } = transformationRequest;

    let transformedData: unknown;
    let recordCount: number;

    switch (sourceType) {
      case 'customers':
        transformedData = await this.transformCustomerData(transformationType);
        recordCount = Array.isArray(transformedData)
          ? transformedData.length
          : Object.keys(transformedData as Record<string, unknown>).length;
        break;
      case 'invoices':
        transformedData = await this.transformInvoiceData(transformationType);
        recordCount = Array.isArray(transformedData)
          ? transformedData.length
          : Object.keys(transformedData as Record<string, unknown>).length;
        break;
      case 'queries':
        transformedData = await this.transformQueryData(transformationType);
        recordCount = Array.isArray(transformedData)
          ? transformedData.length
          : Object.keys(transformedData as Record<string, unknown>).length;
        break;
      default:
        throw new Error(`Unsupported source type: ${String(sourceType)}`);
    }

    if (format === 'csv') {
      transformedData = this.convertToCSV(transformedData as unknown[]);
    } else if (format === 'xml') {
      transformedData = this.convertToXML(transformedData);
    }

    return {
      transformedData,
      recordCount,
      format,
    };
  }

  private processSalesLead(
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return Promise.resolve({
      leadId: String(data.id) || 'generated-id',
      status: 'processed',
      assignedTo: 'sales-team',
      priority: String(data.priority) || 'medium',
      followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  private processPaymentNotification(
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return Promise.resolve({
      paymentId: String(data.paymentId),
      status: 'verified',
      amount: Number(data.amount),
      processedAt: new Date().toISOString(),
    });
  }

  private processCustomerUpdate(
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return Promise.resolve({
      customerId: String(data.customerId),
      updatedFields: Array.isArray(data.fields) ? data.fields : [],
      lastModified: new Date().toISOString(),
    });
  }

  private async transformCustomerData(
    transformationType: string,
  ): Promise<unknown> {
    const customers = await this.clientModel
      .find({ removed: false })
      .select('name email country phone address enabled')
      .exec();

    switch (transformationType) {
      case 'export':
        return customers;
      case 'aggregate':
        const byCountry = customers.reduce((acc, customer) => {
          acc[customer.country] = (acc[customer.country] || 0) + 1;
          return acc;
        }, {});
        return {
          totalCustomers: customers.length,
          byCountry,
        };
      case 'normalize':
        return customers.map((customer) => ({
          identifier: customer._id,
          displayName: customer.name,
          contactEmail: customer.email,
          location: customer.country,
          phoneNumber: customer.phone,
          address: customer.address,
          status: customer.enabled ? 'active' : 'inactive',
        }));
      default:
        return customers;
    }
  }

  private async transformInvoiceData(
    transformationType: string,
  ): Promise<unknown> {
    const invoices = await this.invoiceModel
      .find({ removed: false })
      .populate('client', 'name')
      .select(
        'number total status paymentStatus date expiredDate currency client',
      )
      .exec();

    switch (transformationType) {
      case 'export':
        return invoices.map((invoice) => ({
          id: invoice._id,
          number: invoice.number,
          clientName: invoice.client.name,
          amount: invoice.total,
          status: invoice.status,
          paymentStatus: invoice.paymentStatus,
          date: invoice.date,
          expiredDate: invoice.expiredDate,
          currency: invoice.currency,
        }));
      case 'aggregate':
        const byStatus = invoices.reduce((acc, invoice) => {
          acc[invoice.status] = (acc[invoice.status] || 0) + 1;
          return acc;
        }, {});
        return {
          totalInvoices: invoices.length,
          totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
          byStatus,
        };
      case 'normalize':
        return invoices.map((invoice) => ({
          identifier: invoice._id,
          invoiceNumber: invoice.number,
          clientName: invoice.client.name,
          value: invoice.total,
          currentStatus: invoice.status,
          paymentStatus: invoice.paymentStatus,
          createdDate: invoice.date,
          currency: invoice.currency,
        }));
      default:
        return invoices;
    }
  }

  private async transformQueryData(
    transformationType: string,
  ): Promise<unknown> {
    const queries = await this.queryModel
      .find({ removed: false })
      .populate('customer', 'name email')
      .select('description status resolution notes customer createdAt')
      .exec();

    switch (transformationType) {
      case 'export':
        return queries.map((query) => ({
          id: query._id,
          customerName: query.customer.name,
          customerEmail: query.customer.email,
          description: query.description,
          status: query.status,
          resolution: query.resolution,
          notesCount: query.notes.length,
          created: query.createdAt,
        }));
      case 'aggregate':
        const byStatus = queries.reduce((acc, query) => {
          acc[query.status] = (acc[query.status] || 0) + 1;
          return acc;
        }, {});
        return {
          totalQueries: queries.length,
          byStatus,
        };
      case 'normalize':
        return queries.map((query) => ({
          identifier: query._id,
          customerName: query.customer.name,
          issue: query.description,
          currentStatus: query.status,
          resolution: query.resolution,
          reportedDate: query.createdAt,
        }));
      default:
        return queries;
    }
  }

  private convertToCSV(data: unknown[]): string {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    const firstItem = data[0] as Record<string, unknown>;
    const headers = Object.keys(firstItem);
    const csvContent = [
      headers.join(','),
      ...data.map((row) => {
        const rowData = row as Record<string, unknown>;
        return headers
          .map((header) => JSON.stringify(rowData[header] || ''))
          .join(',');
      }),
    ].join('\n');

    return csvContent;
  }

  private convertToXML(data: unknown): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';

    if (Array.isArray(data)) {
      const xmlBody = data
        .map((item) => {
          const itemData = item as Record<string, unknown>;
          const itemXml = Object.entries(itemData)
            .map(([key, value]) => `<${key}>${String(value)}</${key}>`)
            .join('');
          return `<item>${itemXml}</item>`;
        })
        .join('');

      return `${xmlHeader}<root>${xmlBody}</root>`;
    } else {
      const objectData = data as Record<string, unknown>;
      const xmlBody = Object.entries(objectData)
        .map(([key, value]) => `<${key}>${String(value)}</${key}>`)
        .join('');

      return `${xmlHeader}<root>${xmlBody}</root>`;
    }
  }

  private async getCustomersData() {
    const totalCustomers = await this.clientModel.countDocuments({
      removed: false,
    });
    const activeCustomers = await this.clientModel.countDocuments({
      removed: false,
      enabled: true,
    });
    const inactiveCustomers = await this.clientModel.countDocuments({
      removed: false,
      enabled: false,
    });

    return {
      total: totalCustomers,
      active: activeCustomers,
      inactive: inactiveCustomers,
    };
  }

  private async getInvoicesData() {
    const totalInvoices = await this.invoiceModel.countDocuments({
      removed: false,
    });
    const totalAmount = await this.invoiceModel.aggregate([
      { $match: { removed: false } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    const byStatus = await this.invoiceModel.aggregate([
      { $match: { removed: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const byMonth = await this.invoiceModel.aggregate([
      { $match: { removed: false } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$total' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    const statusObj = byStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const monthObj = byMonth.reduce((acc, item) => {
      const monthKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      acc[monthKey] = item.total;
      return acc;
    }, {});

    return {
      total: totalInvoices,
      totalAmount: totalAmount[0]?.total || 0,
      byStatus: statusObj,
      byMonth: monthObj,
    };
  }

  private async getQueriesData() {
    const totalQueries = await this.queryModel.countDocuments({
      removed: false,
    });
    const byStatus = await this.queryModel.aggregate([
      { $match: { removed: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusObj = byStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return {
      total: totalQueries,
      byStatus: statusObj,
      averageResolutionTime: 3.5,
    };
  }

  private async getPaymentsData() {
    const totalPayments = await this.paymentModel.countDocuments({
      removed: false,
    });
    const totalAmount = await this.paymentModel.aggregate([
      { $match: { removed: false } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const paidInvoices = await this.invoiceModel.countDocuments({
      removed: false,
      paymentStatus: 'paid',
    });
    const pendingInvoices = await this.invoiceModel.countDocuments({
      removed: false,
      paymentStatus: 'unpaid',
    });
    const partialInvoices = await this.invoiceModel.countDocuments({
      removed: false,
      paymentStatus: 'partially',
    });

    return {
      total: totalPayments,
      totalAmount: totalAmount[0]?.total || 0,
      byPaymentStatus: {
        paid: paidInvoices,
        pending: pendingInvoices,
        partial: partialInvoices,
      },
    };
  }

  async getCustomersRaw(): Promise<unknown[]> {
    return await this.clientModel
      .find({ removed: false })
      .select('name email phone country address enabled createdAt updatedAt')
      .exec();
  }

  async getInvoicesRaw(): Promise<unknown[]> {
    return await this.invoiceModel
      .find({ removed: false })
      .populate('client', 'name email')
      .select(
        'number total status paymentStatus date expiredDate currency client items createdAt updatedAt',
      )
      .exec();
  }

  async getQueriesRaw(): Promise<unknown[]> {
    return await this.queryModel
      .find({ removed: false })
      .populate('customer', 'name email')
      .select(
        'description status resolution notes customer createdAt updatedAt',
      )
      .exec();
  }

  async getPaymentsRaw(): Promise<unknown[]> {
    return await this.paymentModel
      .find({ removed: false })
      .populate('client', 'name email')
      .populate('invoice', 'number total')
      .select(
        'number amount currency date paymentMode ref description client invoice createdAt updatedAt',
      )
      .exec();
  }
}
