import dotenv from 'dotenv';
import mongoose, { Connection } from 'mongoose';
import { logger } from '../core/logging/logger';
import { id as reportIndexesId, up as reportIndexesUp } from './migrations/001-report-indexes';

dotenv.config();

type Migration = {
  id: string;
  up: (connection: Connection) => Promise<void>;
};

const migrations: Migration[] = [
  {
    id: reportIndexesId,
    up: reportIndexesUp,
  },
];

const run = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/sidewalk';
  await mongoose.connect(uri);
  const connection = mongoose.connection;
  const migrationCollection = connection.collection('migrations');

  for (const migration of migrations) {
    const alreadyApplied = await migrationCollection.findOne({ id: migration.id });
    if (alreadyApplied) {
      logger.info('Migration already applied', { id: migration.id });
      continue;
    }

    logger.info('Applying migration', { id: migration.id });
    await migration.up(connection);
    await migrationCollection.insertOne({
      id: migration.id,
      appliedAt: new Date(),
    });
  }

  logger.info('Migrations complete');
  await mongoose.disconnect();
};

run().catch(async (error) => {
  logger.error('Migration failed', {
    error: error instanceof Error ? error.message : String(error),
  });
  await mongoose.disconnect();
  process.exit(1);
});
