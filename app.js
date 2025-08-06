require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const { errors } = require("celebrate");
const rateLimiter = require("./middlewares/rateLimiter");
const mainRouter = require("./routes/index");

const errorHandler = require("./middlewares/error-handler");
const { requestLogger, errorLogger } = require("./middlewares/logger");

const app = express();
const { PORT = 3001 } = process.env;

/* eslint-disable no-console */
// Connexion MongoDB
mongoose.set("strictQuery", true);
mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connect to DB");
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimiter);
app.use(requestLogger);

app.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("Server will crash now");
  }, 0);
});
// Utiliser le routeur principal
app.use("/", mainRouter);
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
/* eslint-enable no-console */
