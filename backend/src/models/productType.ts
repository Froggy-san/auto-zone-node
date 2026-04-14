import mongoose, { Document, Schema } from "mongoose";

interface IProductType extends Document {
  name: string;
  category: mongoose.Types.ObjectId;
  image: string;
}

const productTypeSchema = new Schema({
  name: {
    type: String,
    required: [true, ""],
  },
});
