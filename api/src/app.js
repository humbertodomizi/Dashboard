const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const routes = require("./routes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});

module.exports = app;
