import {UserModel} from "../models/User.js";
import bcrypt from "bcryptjs";
import {tokenService} from "../service/token.service.js";

export const login = async (req, res) => {
	try {
		const { email, password} = req.body

		const existingUser = await UserModel.findOne({ email })
		if (!existingUser) {
			res.status(400).json({message: 'Пользователь не найден'})
		}

		const passwordEqual = await bcrypt.compare(
			password,
			existingUser.password
		)

		if (!passwordEqual) {
			res.status(400).json({message: "Пароль не свопадает"})
		}

		const tokens = tokenService.generate({ _id: existingUser._id });
		await tokenService.save(existingUser._id, tokens.refreshToken);

		res.status(200).send({ ...tokens, userId: existingUser._id });

	} catch (e) {
		res.status(500).json({message: "Ошибка на сервере, попробейте позже"})
	}

}

export const signUp = async (req, res) => {
	try {
		const {email, password} = req.body

		const existingUser = await UserModel.findOne({ email })
		if (existingUser) {
			return res.status(400).json({ message: "email уже занят" });
		}

		const hashedPassword = await bcrypt.hash(password, 12)

		const newUser = await UserModel.create({
			email,
			password: hashedPassword
		})

		const tokens = tokenService.generate({ _id: newUser._id });
		await tokenService.save(newUser._id, tokens.refreshToken);

		res.status(201).send({ ...tokens, userId: newUser._id });
	} catch (e) {
		res.status(500).json({message: "Ошибка на сервере, попробейте позже"})
	}
}

export const refreshToken = async (req, res) => {
	try {
		const { refresh_token: refreshToken } = req.body;
		//  в дате id пользователя к которому прекреплен токен
		const data = tokenService.validateRefresh(refreshToken);
		const dbToken = await tokenService.findToken(refreshToken);

		if (!data || !dbToken || data._id !== dbToken?.user?.toString()) {
			return res.status(401).json({ message: "Unauthorized" });
		}
		const tokens = await tokenService.generate({ _id: data._id });
		await tokenService.save(data._id, tokens.refreshToken);

		// console.log('reshreshToken',{ ...tokens, userId: data._id })
		res.status(200).send({ ...tokens, userId: data._id });
	} catch (e) {
		res.status(500).json({
			message: "На сервере произошла ошибка, попробуйте позже",
		});
	}
}

export const getMe = async (req, res) => {
	try {
		const {token} = req.body
		const usedToken = await tokenService.validateAccess(token)
		// console.log(usedToken)

		res.status(200).json(usedToken)

	} catch (e) {
		res.status(500).json({
			message: "На сервере произошла ошибка, попробуйте позже",
		});
	}
}