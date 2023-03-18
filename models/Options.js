import { Schema, model } from "mongoose";

const schema = new Schema({
	years: [Number],
	fuel: [String],
	type: [String],
	box: [String],
	bodyType: [String],
})


export const OptionsModel = model('Options', schema)