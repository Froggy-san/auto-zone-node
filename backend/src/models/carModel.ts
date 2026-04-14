import mongoose, { Schema, model, Document } from "mongoose";

export interface ICar extends Document {
  plateNumber: string;
  chassisNumber: string;
  motorNumber: string;
  color?: string;
  odometer?: string; // Sticking to string as per your SQL 'character varying'
  notes?: string;
  client: mongoose.Types.ObjectId;
  carGeneration: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const carSchema = new Schema<ICar>(
  {
    plateNumber: {
      type: String,
      required: [true, "Plate number is required"],
      trim: true,
      uppercase: true,
    },
    chassisNumber: {
      type: String,
      required: [true, "Chassis number is required"],
      unique: true, // Unique constraint for vehicle identification
      trim: true,
    },
    motorNumber: {
      type: String,
      required: [true, "Motor number is required"],
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    odometer: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      default: "",
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: [true, "A car must belong to a client"],
    },
    carGeneration: {
      type: Schema.Types.ObjectId,
      ref: "carGenerations",
      required: [true, "A car must have a specific generation/model"],
    },
  },
  { timestamps: true },
);

export const Car = model<ICar>("Car", carSchema);
