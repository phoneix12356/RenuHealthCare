import express from "express";
import { configDotenv } from "dotenv";
import cors from "cors";
import connectToDataBase from './config/DataBase.js'
import routes from './routes/index.js';
import cookieParser from "cookie-parser";
configDotenv();
const app = express();
const port = process.env.Port || 5000;
connectToDataBase()


app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/api',routes);

app.listen(port, () => {
  console.log("Server is Running at port" + port);
});


