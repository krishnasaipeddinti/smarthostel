const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const healthRoutes = require("./routes/healthRoutes");
const hostelRoutes = require("./routes/hostelRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Allow both the deployed Vercel frontend and the local dev server
const allowedOrigins = [
  "https://smarthostel-nine.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: origin ${origin} is not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/hostel", hostelRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;