import {ProductModel} from "../models/Product.js";
import chalk from "chalk";

export const createProduct = async (req, res) => {
	try {
		const doc = new ProductModel({
			...req.body
		})
		const newProduct = await doc.save()

		res.status(201).json(newProduct)

	} catch (e) {
		console.log(chalk.red(e.message))
		res.status(500).json({
			message: "Не удалось создать пост"
		})
	}
}

export const getProducts = async (req, res) => {
	try {
		const list = await ProductModel.find()
		if (list) {
			res.status(200).send(list)
		}

	} catch (e) {
		res.status(500).json({
			message: "Не удалось получить товары"
		})
	}
}

export const deleteProduct = async (req, res) => {
	try {
		const {id} = req.body
		await ProductModel.findByIdAndDelete(id)
		res.json({
			success: true,
			message: 'Продукт удален'
		})

	} catch (e) {
		console.log(chalk.red(e.message))
		res.status(500).json({
			message: "Не удалось удалить товары"
		})
	}
}

export const getOneProduct = async (req, res) => {
	try {
		const {id} = req.params
		const product = await ProductModel.findById(id)
		if (product) {
			res.status(200).send(product)
		}

	} catch (e) {
		res.status(500).json({
			message: 'Не удалось найти продукт'
		})
	}
}


export const updateProduct = async (req, res) => {
	try {
		const {id} = req.params
		await ProductModel.updateOne({
			_id: id,
		}, {
			...req.body
		})

		res.status(200).json({
			success: true,
			message: 'Продукт обновлен'
		})
	} catch (e) {
		res.status(500).json({
			message: 'Не удалось обновить продукт'
		})
	}
}

export const findProducts = async (req, res) => {
	try {
		const { search, category, model, year } = req.query;
		const list = await ProductModel.find({product: search})
		console.log(list)
		res.status(200).send(list)


	} catch (e) {
		res.status(500).json({
			message: 'Не найти продукт'
		})
	}
}