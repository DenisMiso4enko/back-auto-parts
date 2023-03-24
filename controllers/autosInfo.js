import {AutosModel} from "../models/Autos.js";
import {OptionsModel} from "../models/Options.js";
import {ProductModel} from "../models/Product.js";

export const getAutosInfo = async (req, res) => {
	try {
		const list = await AutosModel.find()
		if (list) {
			res.status(200).json(list)
		}

	} catch (e) {
		res.status(500).json({
			message: "Не получить данные",
		});
	}
}

export const getOptionsInfo =  async (req, res) => {
	try {
		const list = await OptionsModel.find()
		if (list) {
			res.status(200).json(list)
		}

	} catch (e) {
		res.status(500).json({
			message: "Не получить данные",
		});
	}
}

export const getPartsList =  async (req, res) => {
	try {
		const partsList = await ProductModel.distinct("product")
		if (partsList) {
			res.status(200).json(partsList)
		}
	} catch (e) {
		console.log(e.message)
		res.status(500).json({message: 'Не удалось загрузить запчасти'})
	}
}