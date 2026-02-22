import { Schema, model, type HydratedDocument, Types } from 'mongoose';
import { REPORT_STATUSES, type ReportStatus } from './report.model';

export interface StatusUpdate {
  reportId: Types.ObjectId;
  status: ReportStatus;
  evidence?: string;
  stellar_tx_hash: string | null;
}

const statusUpdateSchema = new Schema<StatusUpdate>(
  {
    reportId: {
      type: Schema.Types.ObjectId,
      ref: 'Report',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: REPORT_STATUSES,
      required: true,
    },
    evidence: {
      type: String,
      required: false,
    },
    stellar_tx_hash: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

statusUpdateSchema.index({ reportId: 1, createdAt: -1 });

export type StatusUpdateDocument = HydratedDocument<StatusUpdate>;

export const StatusUpdateModel = model<StatusUpdate>(
  'StatusUpdate',
  statusUpdateSchema,
);
