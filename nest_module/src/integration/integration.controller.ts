import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { IntegrationService } from './integration.service';

export interface WebhookPayload {
  type: string;
  data: Record<string, unknown>;
  timestamp?: string;
  source?: string;
}

export interface ReportsSummaryResponse {
  customers: {
    total: number;
    active: number;
    inactive: number;
  };
  invoices: {
    total: number;
    totalAmount: number;
    byStatus: Record<string, number>;
    byMonth: Record<string, number>;
  };
  queries: {
    total: number;
    byStatus: Record<string, number>;
    averageResolutionTime?: number;
  };
  payments: {
    total: number;
    totalAmount: number;
    byPaymentStatus: Record<string, number>;
  };
}

@Controller('integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Get('reports/summary')
  async getReportsSummary(): Promise<ReportsSummaryResponse> {
    try {
      return await this.integrationService.generateReportsSummary();
    } catch {
      throw new HttpException(
        'Failed to generate reports summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('webhook')
  async handleWebhook(@Body() payload: WebhookPayload): Promise<{
    success: boolean;
    message: string;
    processedData?: unknown;
  }> {
    try {
      const result = await this.integrationService.processWebhook(payload);
      return {
        success: true,
        message: 'Webhook processed successfully',
        processedData: result,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to process webhook: ${errorMessage}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('customers/analytics')
  async getCustomerAnalytics(): Promise<{
    demographics: Record<string, unknown>;
    topCustomersByRevenue: unknown[];
    recentActivity: unknown[];
  }> {
    try {
      return await this.integrationService.getCustomerAnalytics();
    } catch {
      throw new HttpException(
        'Failed to fetch customer analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('invoices/metrics')
  async getInvoiceMetrics(): Promise<{
    monthlyTrends: unknown[];
    statusDistribution: Record<string, number>;
    averageInvoiceValue: number;
    overdueInvoices: unknown[];
  }> {
    try {
      return await this.integrationService.getInvoiceMetrics();
    } catch {
      throw new HttpException(
        'Failed to fetch invoice metrics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('data/transform')
  async transformData(
    @Body()
    transformationRequest: {
      sourceType: 'customers' | 'invoices' | 'queries';
      transformationType: 'export' | 'aggregate' | 'normalize';
      filters?: Record<string, unknown>;
      format?: 'json' | 'csv' | 'xml';
    },
  ): Promise<{
    transformedData: unknown;
    recordCount: number;
    format: string;
  }> {
    try {
      const result = await this.integrationService.transformData(
        transformationRequest,
      );
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Data transformation failed: ${errorMessage}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('data/customers')
  async getCustomersData(): Promise<{
    data: unknown[];
    total: number;
    message: string;
  }> {
    try {
      const customers = await this.integrationService.getCustomersRaw();
      return {
        data: customers,
        total: customers.length,
        message: 'Customers data retrieved successfully',
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to fetch customers data: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('data/invoices')
  async getInvoicesData(): Promise<{
    data: unknown[];
    total: number;
    message: string;
  }> {
    try {
      const invoices = await this.integrationService.getInvoicesRaw();
      return {
        data: invoices,
        total: invoices.length,
        message: 'Invoices data retrieved successfully',
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to fetch invoices data: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('data/queries')
  async getQueriesData(): Promise<{
    data: unknown[];
    total: number;
    message: string;
  }> {
    try {
      const queries = await this.integrationService.getQueriesRaw();
      return {
        data: queries,
        total: queries.length,
        message: 'Queries data retrieved successfully',
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to fetch queries data: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('data/payments')
  async getPaymentsData(): Promise<{
    data: unknown[];
    total: number;
    message: string;
  }> {
    try {
      const payments = await this.integrationService.getPaymentsRaw();
      return {
        data: payments,
        total: payments.length,
        message: 'Payments data retrieved successfully',
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to fetch payments data: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
