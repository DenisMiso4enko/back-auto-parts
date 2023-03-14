import express from "express"
import chalk from "chalk";
import cors from "cors"
import config from "config"
import mongoose from "mongoose";
import multer from "multer"
import {auth} from "./middleware/auth.middleware.js";
import {getMe, login, refreshToken, signUp} from "./controllers/UserControlles.js";
import {
  createProduct,
  deleteProduct, findProducts,
  getOneProduct,
  getProducts,
  updateProduct
} from "./controllers/ProductControllers.js";
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
// app.post('/upload', upload.single('image'), (req, res) => {
//   res.json({
//     url: `/uploads/${req.file.originalname}`
//   })
// })


// routes
// auth login
app.post('/admin/auth', login);
// sighUp
app.post('/admin/signUp', signUp);
// refresh Token
app.post('/admin/refreshToken',  refreshToken)
// access token getMe
app.post('/admin/verify', getMe)


// загрузка нескольких файлов
app.post('/upload', upload.array('image'), (req, res) => {
  const file = req.files
  const originalNames = file.map(file => `/uploads/${file.originalname}`)

  res.send(originalNames)
  // res.json({
  //   url: `/uploads/${req.file.originalname}`
  // })
})

// работа с товарами
app.post('/admin/createProduct', createProduct)
app.get('/admin/getProducts', getProducts)
app.delete('/admin/deleteProduct', deleteProduct)
app.get('/admin/getOne/:id', getOneProduct)
app.patch('/admin/updateProduct/:id', updateProduct)

// поиск
app.get('/admin/search', findProducts)


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
// post  http://localhost:8888/admin/auth - для авторизации
// принимает email и password и возвращает accessToken, refreshHToken, userId, expiresIn(срок действия токенв)

// post http://localhost:8888/admin/refreshToken - для обновления токена
// принимает refresh_token со значение refreshHToken, и возвращает тоже что и для авторизации

// post http://localhost:8888/admin/verify - получение accessToken
// принимает accessToken и если все работает то придет данные если нет то null


// post http://localhost:8888/admin/createProduct - создание товара
// принимает body с данными из формы,

// get http://localhost:8888/admin/getProducts - получение всех поство
// ничего не принимает возвращает массив продуктов

// delete http://localhost:8888/admin/deleteProduct - удаление товара
// принимает в body id поста и если все хорошо придет сообщение success: true, message: 'Продукт удален'

// get http://localhost:8888/admin/getOne/:id - получение одного товара
// id надо передать в параментры и созвращаеться товар

// patch http://localhost:8888/admin/updateProduct/:id - обновление продукта
// id продукта вставить в параметры и так же принимает body данные из формы, если все хорошо success: true, message: 'Продукт обновлен'


// patch http://localhost:8888/admin/search?query - поиск по запчасти
// будет в query вставляеться значение из инпута и в ответ приходит массив запчастей с этим именем