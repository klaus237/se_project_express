const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

const mainRouter = require("./routes/index");
const { errors } = require("celebrate");
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

app.use(requestLogger);
// Utiliser le routeur principal
app.use("/", mainRouter);
app.use(errorLogger);
app.use(errors());
app.use(errorHandler); //Middleware gestion des erreurs

// Middleware gestion des erreurs
// eslint-disable-next-line no-unused-vars
// app.use((err, req, res, next) => {
//   const { statusCode = 500, message } = err;
//   res.status(statusCode).json({
//     message: statusCode === 500 ? "Internal Server Error" : message,
//   });
// });

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
/* eslint-enable no-console */
