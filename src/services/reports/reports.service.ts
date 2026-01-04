import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { BeauticiansService } from '../beauticians/beauticians.service';
import { BusinessService } from '../business/business.service';
import { ServicesService } from '../services/services.service';
import { AppointmentsService } from '../appointments/appointments.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly beauticiansService: BeauticiansService,
    private readonly businessesService: BusinessService,
    private readonly servicesService: ServicesService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  async getTotalCustomers() {
    try {
      return this.usersService.getTotalUsers();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getActiveCustomers() {
    try {
      return this.appointmentsService.getActiveCustomers();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAverageAppointmentsPerCustomer() {
    try {
      return this.appointmentsService.getAverageAppointmentsPerCustomer();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getTotalBeauticians() {
    return this.beauticiansService.getTotalBeauticians();
  }

  async getAverageRatingPerBeautician() {
    return this.beauticiansService.getAverageRatingPerBeautician();
  }

  async getAppointmentsPerBeautician() {
    return this.beauticiansService.getAppointmentsPerBeautician();
  }

  async getTotalBusinesses() {
    return this.businessesService.getTotalBusinesses();
  }

  async getAverageRatingPerBusiness() {
    return this.businessesService.getAverageRatingPerBusiness();
  }

  async getActiveServicesPerBusiness() {
    return this.businessesService.getActiveServicesPerBusiness();
  }

  async getMostPopularServices(limit: number = 10) {
    return this.servicesService.getMostPopularServices(limit);
  }

  async getRevenuePerService() {
    return this.servicesService.getRevenuePerService();
  }

  async getServicesPerCategory() {
    return this.servicesService.getServicesPerCategory();
  }

  async getRevenuePerCategory() {
    return this.servicesService.getRevenuePerCategory();
  }

  async getAppointmentsByStatus() {
    return this.appointmentsService.getAppointmentsByStatus();
  }

  async getRevenueByMonth() {
    return this.appointmentsService.getRevenueByMonth();
  }

  async getKpis() {
    const totalCustomers = await this.usersService.getTotalUsers();
    const totalBusinesses = await this.businessesService.getTotalBusinesses();
    const totalBeauticians =
      await this.beauticiansService.getTotalBeauticians();
    const totalActiveAppointments =
      await this.appointmentsService.getAppointmentsByStatus();

    const data = {
      ...totalCustomers,
      ...totalBusinesses,
      ...totalBeauticians,
      totalActiveAppointments: totalActiveAppointments.find(
        (predicate) => predicate.status === 'confirmed',
      )?.count,
    };

    return data;
  }
}
