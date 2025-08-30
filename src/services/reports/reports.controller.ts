import { Controller, Get, Param } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('customers/total')
  getTotalCustomers() {
    return this.reportsService.getTotalCustomers();
  }

  @Get('customers/active')
  getActiveCustomers() {
    return this.reportsService.getActiveCustomers();
  }

  @Get('customers/average-appointments')
  getAverageAppointmentsPerCustomer() {
    return this.reportsService.getAverageAppointmentsPerCustomer();
  }

  @Get('beauticians/total')
  getTotalBeauticians() {
    return this.reportsService.getTotalBeauticians();
  }

  @Get('beauticians/average-rating')
  getAverageRatingPerBeautician() {
    return this.reportsService.getAverageRatingPerBeautician();
  }

  @Get('beauticians/appointments')
  getAppointmentsPerBeautician() {
    return this.reportsService.getAppointmentsPerBeautician();
  }

  @Get('businesses/total')
  getTotalBusinesses() {
    return this.reportsService.getTotalBusinesses();
  }

  @Get('businesses/average-rating')
  getAverageRatingPerBusiness() {
    return this.reportsService.getAverageRatingPerBusiness();
  }

  @Get('businesses/active-services')
  getActiveServicesPerBusiness() {
    return this.reportsService.getActiveServicesPerBusiness();
  }

  @Get('services/popular/:limit')
  getMostPopularServices(@Param('limit') limit: number) {
    return this.reportsService.getMostPopularServices(limit);
  }

  @Get('services/revenue')
  getRevenuePerService() {
    return this.reportsService.getRevenuePerService();
  }

  @Get('categories/services-count')
  getServicesPerCategory() {
    return this.reportsService.getServicesPerCategory();
  }

  @Get('categories/revenue')
  getRevenuePerCategory() {
    return this.reportsService.getRevenuePerCategory();
  }

  @Get('appointments/status')
  getAppointmentsByStatus() {
    return this.reportsService.getAppointmentsByStatus();
  }

  @Get('appointments/revenue')
  getRevenueByMonth() {
    return this.reportsService.getRevenueByMonth();
  }
}
