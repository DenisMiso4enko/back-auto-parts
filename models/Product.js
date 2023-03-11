import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    mark: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    mode: {
      type: String,
    },
    volume: {
      type: String,
    },
    fuel: {
      type: String,
    },
    type: {
      type: String,
    },
    bodyType: {
      type: String,
    },
    box: {
      type: String,
    },
    product: {
      type: String,
      required: true,
    },
    imagesUrl: {
      // images
      type: [String],
    },
    article: {
      type: Number, // and  string
    },
    numberOfProduct: {
      type: Number,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
    },
    currency: {
      type: String,
    },
    state: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const ProductModel = model("Product", schema);
