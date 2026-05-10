import { model, Schema } from "mongoose";

export interface IServiceStatus {
  id: string;

  createdAt: Date;
  updatedAt: Date;
  name: string;
  colorLight: string;
  colorDark: string;
  description: string;
}

const ServiceStatusSchema = new Schema<IServiceStatus>(
  {
    name: {
      type: String,
      required: true,
    },
    colorLight: {
      type: String,
      default: `{"h":0,"s":0,"l":0}`,
    },
    colorDark: {
      type: String,
      default: `{"h":0,"s":0,"l":0}`,
    },
    description: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const ServiceStatus = model<IServiceStatus>(
  "serviceStatuses",
  ServiceStatusSchema,
);
