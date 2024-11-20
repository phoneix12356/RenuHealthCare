import express from "express";
import { config } from "dotenv";
import cors from "cors";
import connectToDataBase from "./config/DataBase.js";
import routes from "./routes/index.js";
import cookieParser from "cookie-parser";
import winston from "winston";

config();

const app = express();
const port = process.env.PORT || 5000;

connectToDataBase();

// Create a logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
    }),
  ],
  exitOnError: false, // do not exit on handled exceptions
});

// Create a middleware to log incoming requests
const requestLogger = (req, res, next) => {
  const { method, url, headers, body } = req;
  logger.info({
    message: "Incoming request",
    method,
    url,
    // headers,
    // body,
  });
  next();
};

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger); // Add the request logger middleware
app.use("/api", routes);

app.listen(port, () => {
  console.log("Server is Running at port" + port);
  logger.info(`Server is Running at port ${port}`);
});
