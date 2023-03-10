import express from "express"
import chalk from "chalk";
import cors from "cors"
import config from "config"
import mongoose from "mongoose";

const PORT = config.get('port') ?? 8888

const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors())


// http://localhost:8888
app.get('/', (req, res) => {
  res.send('Hello word')
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