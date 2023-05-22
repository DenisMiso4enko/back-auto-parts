import { Router } from "express";
import { ProductModel } from "../models/Product.js";
import { paginateResults } from "../PaginateResults/PaginateResults.js";

export const mainRouter = Router();

mainRouter.get("/getAllParts", async (req, res) => {
  try {
    const { product, mark, model, article, year, numberOfProduct } = req.query;
    const queries = {};
    if (product) {
      queries.product = { $regex: product, $options: "i" };
    }
    if (mark) {
      queries.mark = mark;
    }
    if (model) {
      queries.model = model;
    }
    if (article) {
      queries.article = article;
    }
    if (year) {
      queries.year = year;
    }
    if (numberOfProduct) {
      queries.numberOfProduct = numberOfProduct;
    }

    const list = await ProductModel.find(queries).sort({ createdAt: -1 });
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const results = paginateResults(page, limit, list);

    if (list) {
      res.status(200).json(results);
    }
  } catch (e) {
    res.status(500).json({
      message: "Не удалось найти продукт",
    });
  }
});

mainRouter.get("/getOne/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findByIdAndUpdate(id, {
      $inc: { views: 1 },
    });
    if (product) {
      res.status(200).json(product);
    }
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: "Не удалось найти деталь",
    });
  }
});

// mainRouter.get("/search", async (req, res) => {
//   try {
//     const { article, year, mark, model, product, numberOfProduct } = req.query;
//
//     const queries = {};
//     if (article) {
//       queries.article = article;
//     }
//     if (year) {
//       queries.year = year;
//     }
//     if (mark) {
//       queries.mark = mark;
//     }
//     if (model) {
//       queries.model = model;
//     }
//     if (product) {
//       queries.product = { $regex: product, $options: "i" };
//     }
//     if (numberOfProduct) {
//       queries.numberOfProduct = numberOfProduct;
//     }
//
//     const list = await ProductModel.find(queries).sort({ createdAt: -1 });
//
//     const page = parseInt(req.query.page);
//     const limit = parseInt(req.query.limit);
//
//     const results = paginateResults(page, limit, list);
//     if (list) {
//       res.status(200).json(results);
//     }
//   } catch (error) {
//     console.log(e.message);
//     res.status(500).json({
//       message: "Не удалось получить товары",
//     });
//   }
// });
