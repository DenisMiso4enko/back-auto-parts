import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    mark: {
      type: String,
    },
    model: {
      type: String,
    },
    year: {
      type: Number,
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
    },
    imagesUrl: {
      // images
      type: [String],
    },
    article: {
      type: String, // and  string
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
