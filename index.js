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
import {getAutosInfo, getOptionsInfo} from "./controllers/autosInfo.js";


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
app.post('/admin/auth', login);
app.post('/admin/signUp', signUp);
app.post('/admin/refreshToken',  refreshToken)
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

// получить данные о машинах
app.get('/getAutosInfo', getAutosInfo)
app.get('/getOptionsInfo', getOptionsInfo)


async function start() {
  try {
    // mongoose.connection.once("open", () => {
    //   initDatabase()
    // });
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