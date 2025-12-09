/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Location } from './entities/location.entity';
import { Business } from '../business/entities/business.entity';
import { CreateGeographicDto } from './dto/create-geographic.dto';
import { UpdateGeographicDto } from './dto/update-geographic.dto';

@Injectable()
export class GeographicsService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateGeographicDto): Promise<Location> {
    try {
      const location = this.locationRepository.create({
        country: dto.country,
        city: dto.city,
        district: dto.district,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
      });

      const saved = await this.locationRepository.save(location);

      if (dto.latitude != null && dto.longitude != null) {
        await this.dataSource.query(
          `UPDATE locations SET geom = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography WHERE id = $3`,
          [dto.longitude, dto.latitude, saved.id],
        );
        saved.geom = '';
      }

      return saved;
    } catch (error) {
      console.error('Error creating geographic:', error);
      throw new InternalServerErrorException('Failed to create geographic');
    }
  }

  async findAll(): Promise<Location[]> {
    try {
      return await this.locationRepository.find();
    } catch (error) {
      console.error('Error fetching geographics:', error);
      throw new InternalServerErrorException('Failed to fetch geographics');
    }
  }

  async findOne(id: string): Promise<Location> {
    const location = await this.locationRepository.findOne({ where: { id } });
    if (!location) {
      throw new NotFoundException(`Geographic with id ${id} not found`);
    }
    return location;
  }

  async update(id: string, dto: UpdateGeographicDto): Promise<Location> {
    const location = await this.locationRepository.findOne({ where: { id } });
    if (!location) {
      throw new NotFoundException(`Geographic with id ${id} not found`);
    }

    Object.assign(location, dto);

    try {
      const updated = await this.locationRepository.save(location);

      if (dto.latitude != null || dto.longitude != null) {
        await this.dataSource.query(
          `UPDATE locations SET geom = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography WHERE id = $3`,
          [
            updated.longitude ?? location.longitude,
            updated.latitude ?? location.latitude,
            updated.id,
          ],
        );
      }

      return updated;
    } catch (error) {
      console.error('Error updating geographic:', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException();
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.locationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Geographic with id ${id} not found`);
    }
  }

  async search(term: string): Promise<Location[]> {
    return await this.locationRepository
      .createQueryBuilder('location')
      .where('location.city ILIKE :term', { term: `%${term}%` })
      .orWhere('location.district ILIKE :term', { term: `%${term}%` })
      .orWhere('location.country ILIKE :term', { term: `%${term}%` })
      .getMany();
  }

  async findNearby(lat: number, lon: number, radiusKm: number = 5) {
    try {
      const query = `
        SELECT b.id, b.name, l.city, l.district, l.address, 
               l.latitude, l.longitude,
               ST_Distance(l.geom, ST_MakePoint($2, $1)::geography) AS distance_m
        FROM businesses b
        JOIN locations l ON b.location_id = l.id
        WHERE ST_DWithin(l.geom, ST_MakePoint($2, $1)::geography, $3)
        ORDER BY distance_m;
      `;

      const result = await this.dataSource.query(query, [
        lat,
        lon,
        radiusKm * 1000,
      ]);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return result;
    } catch (error) {
      console.error('Error in findNearby:', error);
      throw new InternalServerErrorException(
        'Failed to fetch nearby businesses',
      );
    }
  }

  async findLocationByBusinessId(businessId: string) {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['location'],
    });

    if (!business?.location) {
      throw new NotFoundException(
        `Location for business ${businessId} not found`,
      );
    }

    return business.location;
  }

  async findInBounds(
    swLat: number,
    swLng: number,
    neLat: number,
    neLng: number,
  ) {
    if (
      swLat > neLat ||
      swLng > neLng ||
      Math.abs(neLng - swLng) > 180 ||
      Math.abs(neLat - swLat) > 90
    ) {
      throw new InternalServerErrorException('Invalid bounding box');
    }

    const query = `
      SELECT 
        b.id,
        b.name,
        b.description,
        b.owner_id,
        b.logo,
        b.cover_image,
        b.is_active,
        b.is_verified,
        b.rating,
        l.id AS location_id,
        l.city,
        l.district,
        l.address,
        l.latitude,
        l.longitude
      FROM businesses b
      JOIN locations l ON b.location_id = l.id
      WHERE ST_Within(
        ST_SetSRID(ST_MakePoint(l.longitude::double precision, l.latitude::double precision), 4326),
        ST_MakeEnvelope($1, $2, $3, $4, 4326)
      )
      ORDER BY b.name;
    `;

    try {
      const result = await this.dataSource.query(query, [
        swLng,
        swLat,
        neLng,
        neLat,
      ]);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return result.map((row) => ({
        ...row,
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
        lat: parseFloat(row.latitude),
        lng: parseFloat(row.longitude),
      }));
    } catch (error) {
      console.error('Error in findInBounds:', error);
      throw new InternalServerErrorException(
        'Failed to fetch locations in bounds',
      );
    }
  }
}
