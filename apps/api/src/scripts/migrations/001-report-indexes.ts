import { Connection } from 'mongoose';

// Keep migration definitions serializable and explicit.
export const id = '001-report-indexes';

export const up = async (connection: Connection): Promise<void> => {
  const reports = connection.collection('reports');
  await reports.createIndex({ location: '2dsphere' });
  await reports.createIndex({ status: 1, createdAt: -1 });
};
