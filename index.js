import express from "express"
import chalk from "chalk";
import cors from "cors"
import config from "config"
import mongoose from "mongoose";
import {UserModel} from "./models/User.js";
import {tokenService} from "./service/token.service.js";
import bcrypt from "bcryptjs";


const PORT = config.get('port') ?? 8888

const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors())


// http://localhost:8888
// app.get('/', (req, res) => {
//   res.send('Hello word')
// })


// routes
// auth
app.post('/admin/auth', async (req, res) => {
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

    res.status(201).send({ ...tokens, userId: existingUser._id });

  } catch (e) {
    res.status(500).json({message: "Ошибка на сервере, попробейте позже"})
  }

});

// sighUp
// app.post('/admin/signUp', async (req, res) => {
//   try {
//     const {email, password} = req.body
//
//     const existingUser = await UserModel.findOne({ email })
//     if (existingUser) {
//       return res.status(400).json({ message: "email уже занят" });
//     }
//
//     const hashedPassword = await bcrypt.hash(password, 12)
//
//     const newUser = await UserModel.create({
//       email,
//       password: hashedPassword
//     })
//
//     const tokens = tokenService.generate({ _id: newUser._id });
//     await tokenService.save(newUser._id, tokens.refreshToken);
//
//     res.status(201).send({ ...tokens, userId: newUser._id });
//   } catch (e) {
//     res.status(500).json({message: "Ошибка на сервере, попробейте позже"})
//   }
// });

// refresh Token
app.post('/admin/refreshToken',  async (req, res) => {
  try {
    const { refresh_token: refreshToken } = req.body;
    //  в дате id пользователя к которому прекреплен токен
    const data = tokenService.validateRefresh(refreshToken);
    const dbToken = await tokenService.findToken(refreshToken);

    if (!data || !dbToken || data._id !== dbToken?.user?.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const tokens = await tokenService.generate({ id: data._id });
    await tokenService.save(data._id, tokens.refreshToken);

    res.status(200).send({ ...tokens, userId: data._id });
  } catch (e) {
    res.status(500).json({
      message: "На сервере произошла ошибка, попробуйте позже",
    });
  }
})


async function start() {
  try {
    await mongoose.connect(config.get('mongoUrl'))
    console.log(chalk.green('DB connected'))
    app.listen(PORT, () => {
      console.log(chalk.green(`Server start om port ${PORT}`))
    })
  } catch (e) {
    console.log(chalk.red(e.message));
    process.exit(1);
  }
}

start()



// запросы
// http://localhost:8888/admin/auth - для авторизации
// принимает email и password и возвращает accessToken, refreshHToken, userId, expiresIn(срок действия токенв)

// http://localhost:8888/admin/refreshToken - для обновления токена
// принимает refresh_token со значение refreshHToken, и возвращает тоже что и для авторизации