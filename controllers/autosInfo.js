import {AutosModel} from "../models/Autos.js";
import {OptionsModel} from "../models/Options.js";

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