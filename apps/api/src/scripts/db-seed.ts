import dotenv from 'dotenv';
import mongoose, { Types } from 'mongoose';
import { faker } from '@faker-js/faker';
import { logger } from '../core/logging/logger';
import { UserModel } from '../modules/users/user.model';
import {
  REPORT_CATEGORIES,
  REPORT_STATUSES,
  ReportCategory,
  ReportStatus,
  ReportModel,
} from '../modules/reports/report.model';
import { StatusUpdateModel } from '../modules/reports/status-update.model';

dotenv.config();

const USER_COUNT = 50;
const REPORT_COUNT = 500;
const STATUS_UPDATE_COUNT = 100;

const SF_BOUNDS = {
  minLat: 37.7045,
  maxLat: 37.8299,
  minLng: -122.5247,
  maxLng: -122.3366,
};

const randomGeoPointInBounds = () => {
  const latitude = faker.number.float({
    min: SF_BOUNDS.minLat,
    max: SF_BOUNDS.maxLat,
    fractionDigits: 6,
  });
  const longitude = faker.number.float({
    min: SF_BOUNDS.minLng,
    max: SF_BOUNDS.maxLng,
    fractionDigits: 6,
  });

  return {
    type: 'Point' as const,
    coordinates: [longitude, latitude] as [number, number],
  };
};

const randomCategory = (): ReportCategory =>
  faker.helpers.arrayElement([...REPORT_CATEGORIES]);

const randomStatus = (): ReportStatus =>
  faker.helpers.arrayElement([...REPORT_STATUSES]);

const randomIssueTitle = (): string =>
  faker.helpers.arrayElement([
    'Pothole on 5th Ave',
    'Broken street light',
    'Overflowing waste bin',
    'Unsafe crosswalk paint',
    'Flooded drainage channel',
    'Damaged bus stop shelter',
  ]);

const randomMediaUrls = () => {
  const count = faker.number.int({ min: 0, max: 3 });
  return Array.from({ length: count }, () => faker.image.urlPicsumPhotos());
};

const run = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/sidewalk';
  await mongoose.connect(uri);

  logger.info('Clearing collections for deterministic reseed');
  await Promise.all([
    UserModel.deleteMany({}),
    ReportModel.deleteMany({}),
    StatusUpdateModel.deleteMany({}),
  ]);

  const users = Array.from({ length: USER_COUNT }, (_, index) => {
    const isAdmin = index < 5;
    return {
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      role: isAdmin ? 'AGENCY_ADMIN' : 'CITIZEN',
      district: faker.location.city(),
      reputationScore: faker.number.int({ min: 10, max: 100 }),
    };
  });
  const createdUsers = await UserModel.insertMany(users);

  const reports = Array.from({ length: REPORT_COUNT }, () => ({
    title: randomIssueTitle(),
    description: faker.lorem.sentences({ min: 1, max: 3 }),
    status: randomStatus(),
    category: randomCategory(),
    location: randomGeoPointInBounds(),
    stellar_tx_hash: faker.datatype.boolean()
      ? faker.string.hexadecimal({ length: 64, prefix: '' })
      : null,
    media_urls: randomMediaUrls(),
  }));
  const createdReports = await ReportModel.insertMany(reports);

  const statusUpdates = Array.from({ length: STATUS_UPDATE_COUNT }, () => ({
    reportId: faker.helpers.arrayElement(createdReports)._id as Types.ObjectId,
    status: randomStatus(),
    evidence: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
    stellar_tx_hash: faker.datatype.boolean()
      ? faker.string.hexadecimal({ length: 64, prefix: '' })
      : null,
  }));
  await StatusUpdateModel.insertMany(statusUpdates);

  logger.info('Seed complete', {
    users: createdUsers.length,
    reports: createdReports.length,
    statusUpdates: STATUS_UPDATE_COUNT,
  });

  await mongoose.disconnect();
};

run().catch(async (error) => {
  logger.error('Seed failed', {
    error: error instanceof Error ? error.message : String(error),
  });
  await mongoose.disconnect();
  process.exit(1);
});
