import { Schema, Document, model } from "mongoose";

interface ICategory extends Document {
  name: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
  },
  {
    virtuals: true,
    toJSON: { virtuals: true },
  toObject: { virtuals: true },
    timestamps: true, // This automatically creates 'createdAt' and 'updatedAt'
  },
);

// Create a virtual "link" to the ProductType model
categorySchema.virtual('productTypes', {
  ref: 'productTypes',      // The model to link to
  foreignField: 'category', // The field name in ProductType that holds the ID
  localField: '_id'         // The field name in this Category model
});

categorySchema.pre("find", function (next) {
  this.populate("productTypes");
  
});
export const Category = model<ICategory>("categories", categorySchema);
