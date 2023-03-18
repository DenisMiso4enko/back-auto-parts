import { Schema, model } from "mongoose";

const schema = new Schema({
	mark: String,
	models: [String]
})


export const AutosModel = model('Autos', schema)