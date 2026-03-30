const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const pinoHttp = require("pino-http");
const env = require("./config/env");
const logger = require("./config/logger");
const requestIdMiddleware = require("./middleware/requestId.middleware");
const errorMiddleware = require("./middleware/error.middleware");
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const transactionRoutes = require("./routes/transactions.routes");
const reportRoutes = require("./routes/reports.routes");
const budgetRoutes = require("./routes/budgets.routes");
const categoryRoutes = require("./routes/categories.routes");
const settingsRoutes = require("./routes/settings.routes");
const syncRoutes = require("./routes/sync.routes");
const telegramRoutes = require("./routes/telegram.routes");

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN.split(",").map((entry) => entry.trim()),
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(requestIdMiddleware);
app.use(pinoHttp({ logger }));

app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/telegram", telegramRoutes);

app.use(errorMiddleware);

module.exports = app;
