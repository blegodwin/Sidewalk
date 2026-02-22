import { Schema, model, type HydratedDocument } from 'mongoose';

export const USER_ROLES = ['CITIZEN', 'AGENCY_ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface User {
  email: string;
  name: string;
  role: UserRole;
  district?: string;
  reputationScore: number;
}

const userSchema = new Schema<User>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'CITIZEN',
      required: true,
    },
    district: {
      type: String,
      required: false,
    },
    reputationScore: {
      type: Number,
      default: 50,
      min: 0,
    },
  },
  { timestamps: true },
);

export type UserDocument = HydratedDocument<User>;

export const UserModel = model<User>('User', userSchema);
