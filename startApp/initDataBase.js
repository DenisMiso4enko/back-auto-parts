import {AutosModel} from "../models/Autos.js";
import autosMock from "../mock/autos.json" assert  { type: "json" };
import optionsMock from "../mock/options.json" assert  { type: "json" };
import {OptionsModel} from "../models/Options.js";


export async function initDatabase() {
	const autos = await AutosModel.find();
	if (autos.length !== autosMock.length) {
		await createInitialEntry(AutosModel, autosMock);
	}

	const options = await OptionsModel.find();
	if (options.length !== optionsMock.length) {
		await createInitialEntry(OptionsModel, optionsMock);
	}
}

async function createInitialEntry(Model, data) {
	await Model.collection.drop();
	return Promise.all(
		data.map(async (item) => {
			try {
				delete item._id; // удаляет id у тех данных в локальном файле
				const newItem = new Model(item); // создает новую можель из данных
				await newItem.save(); // ждем пока база данных сохранит эту модель
				return newItem;
			} catch (error) {
				return error;
			}
		})
	);
}
