import {Router} from 'express'
import {ProductModel} from "../models/Product.js";
import {paginateResults} from "../PaginateResults/PaginateResults.js";

export const mainRouter = Router()

mainRouter.get("/", async (req, res) => {
	try {
		const page = parseInt(req.query.page);
		const limit = parseInt(req.query.limit);
		const list = await ProductModel.find().sort({ createdAt: -1 });

		console.log(list)

		const results = paginateResults(page, limit, list)
		if (list) {
			res.status(200).json(results);
		}

	} catch (e) {
		console.log(e.message)
		res.status(500).json({
			message: "Не удалось получить товары",
		});
	}
})