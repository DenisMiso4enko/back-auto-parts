import express from 'express'
import chalk from 'chalk'
import cors from 'cors'
import 'dotenv/config'
import fs from 'fs'
import mongoose from 'mongoose'
import multer from 'multer'
import {auth} from './middleware/auth.middleware.js'
import {
	getMe,
	login,
	refreshToken,
	signUp,
} from './controllers/UserControlles.js'
import {
	createProduct,
	deleteProduct,
	getOneProduct,
	getProducts,
	updateProduct,
} from './controllers/ProductControllers.js'
import {
	getAutosInfo,
	getOptionsInfo,
	getPartsList,
} from './controllers/autosInfo.js'
import {mainRouter} from './routes/main.js'

const PORT = process.env.PORT ?? 9090
const url = process.env.PROD === "yes" ? process.env.PROD_URL : process.env.DEV_URL
const corsOptions = {
	origin: "https://auto-gomel-front.vercel.app",
	credentials: true,
}

const app = express()

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', url)
	next()
})

// папка со статичными файлами
app.use('/uploads', express.static('uploads'))

// store multer
const storage = multer.diskStorage({
	// когда будет загружаться любой файл,   будет работать функция которая вернет путь файла
	destination: (_, __, cb) => {
		if (!fs.existsSync('uploads')) {
			fs.mkdirSync('uploads')
		}
		cb(null, 'uploads')
	},
	// перед тем как сохранить функция укажет как называеться файл
	filename: (_, file, cb) => {
		cb(null, file.originalname)
	},
})

const upload = multer({storage})
// запрос на загрузку
// app.post('/upload', upload.single('image'), (req, res) => {
//   res.json({
//     url: `/uploads/${req.file.originalname}`
//   })
// })

// routes
app.post('/admin/auth', login)
app.post('/admin/signUp', signUp)
app.post('/admin/refreshToken', refreshToken)
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
app.post('/admin/createProduct', auth, createProduct)
app.get('/admin/getProducts', getProducts)
app.delete('/admin/deleteProduct', auth, deleteProduct)
app.get('/admin/getOne/:id', getOneProduct)
app.patch('/admin/updateProduct/:id', auth, updateProduct)

// получить данные о машинах
app.get('/getAutosInfo', getAutosInfo)
app.get('/getOptionsInfo', getOptionsInfo)
app.get('/getPartsList', getPartsList)

app.get("/", (req, res, next) => {
	res.send('Hello from express app autoparts!')
})

// client
app.use('/', mainRouter)
app.get("/", (req, res, next) => {
	res.send('Hello World!')
})

async function start() {
	try {
		// mongoose.connection.once("open", () => {
		//   initDatabase()
		// });
		await mongoose.connect(process.env.MONGO_URL)
		console.log(chalk.green('DB connected'))
		app.listen(PORT || 3333, () => {
			console.log(chalk.green(`Server start on port ${PORT}`))
		})
	} catch (e) {
		console.log(chalk.red(e.message))
		process.exit(1)
	}
}

start()


// просто проверка