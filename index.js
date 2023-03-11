import express from "express"
import chalk from "chalk";
import cors from "cors"
import config from "config"
import mongoose from "mongoose";
import {UserModel} from "./models/User.js";
import {tokenService} from "./service/token.service.js";
import bcrypt from "bcryptjs";
import multer from "multer"
import {auth} from "./middleware/auth.middleware.js";
import {ProductModel} from "./models/Product.js";


const PORT = config.get('port') ?? 8888

const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors())
// папка со статичными файлами
app.use("/uploads", express.static("uploads"))


// store multer
const storage = multer.diskStorage({
  // когда будет загружаться любой файл,   будет работать функция которая вернет путь файла
  destination: (_, __, cb) => {
    cb(null, 'uploads')
  },
  // перед тем как сохранить функция укажет как называеться файл
  filename: (_, file, cb) => {
    cb(null, file.originalname)
  }
})

const upload = multer({ storage  })
// запрос на загрузку
app.post('/upload', upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`
  })
})
// создаем пост
app.post('/admin/createProduct', async (req, res) => {
  try {
    const {title, imageUrl} = req.body
    console.log('title',title)
    console.log('imageIrl',imageUrl)
    const doc = new ProductModel({
      title,
      imageUrl,
    })
    const newProduct = await doc.save()

    res.status(201).json(newProduct)

  } catch (e) {
    console.log(chalk.red(e.message))
    res.status(500).json({
      message: "Не удалось создать пост"
    })
  }
})

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

    res.status(200).send({ ...tokens, userId: existingUser._id });

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

    console.log('reshreshToken',{ ...tokens, userId: data._id })
    res.status(200).send({ ...tokens, userId: data._id });
  } catch (e) {
    res.status(500).json({
      message: "На сервере произошла ошибка, попробуйте позже",
    });
  }
})

// access token
app.post('/admin/verify', async (req, res) => {
   try {
     const {token} = req.body
     const usedToken = await tokenService.validateAccess(token)
     console.log(usedToken)

     res.status(200).json(usedToken)

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

// http://localhost:8888/admin/verify - получение accessToken
// принимает accessToken и если все работает то придет данные если нет то null