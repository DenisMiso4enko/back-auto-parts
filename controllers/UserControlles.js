import { UserModel } from "../models/User.js";
import bcrypt from "bcryptjs";
import { tokenService } from "../service/token.service.js";
import jwt from "jsonwebtoken";
import 'dotenv/config';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      res.status(400).json({ message: "Пользователь не найден" });
    }

    const passwordEqual = await bcrypt.compare(password, existingUser.password);

    if (!passwordEqual) {
      res.status(400).json({ message: "Пароль не свопадает" });
    } else {
      const accessToken = jwt.sign({ email: email }, process.env.ACCEESS_SECRET, {
        expiresIn: "50m",
      });
      const refreshToken = jwt.sign({ email: email }, process.env.REFRESH_SECRET, {
        expiresIn: "1h",
      });
      res.status(200).send({userId: existingUser._id, email: existingUser.email, accessToken, refreshToken });
    }
  } catch (e) {
    res.status(500).json({ message: "Ошибка на сервере, попробейте позже" });
  }
};

export const signUp = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "email уже занят" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await UserModel.create({
      email,
      password: hashedPassword,
    });

    const tokens = tokenService.generate({ _id: newUser._id });
    await tokenService.save(newUser._id, tokens.refreshToken);

    res.status(201).send({ ...tokens, userId: newUser._id });
  } catch (e) {
    res.status(500).json({ message: "Ошибка на сервере, попробейте позже" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    const decoded = jwt.verify(refresh_token, process.env.REFRESH_SECRET);

    const user = await UserModel.findOne({email: decoded.email})

    const accessToken = jwt.sign({ email: user.email }, process.env.ACCEESS_SECRET, {
      expiresIn: "50m",
    });
    const refreshToken = jwt.sign({ email: user.email }, process.env.REFRESH_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).send({userId: user._id, email: user.email, accessToken, refreshToken });
  } catch (e) {
    res.status(500).json({
      message: "На сервере произошла ошибка, попробуйте позже",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.ACCEESS_SECRE);
    const user = await UserModel.findOne({email: decoded.email});
    const userInfo = { email: user.email, userId: user._id };
    res.status(200).json(userInfo);
  } catch (e) {
    res.status(500).json({
      message: "На сервере произошла ошибка, попробуйте позже",
    });
  }
};
