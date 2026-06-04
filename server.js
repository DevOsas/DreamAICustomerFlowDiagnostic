const express = require("express");
const path = require("path");

const submitHandler = require("./api/submit");
const configHandler = require("./api/config");

const app = express();
const rootDir = __dirname;

function normalizeBasePath(value) {
  if (!value || value === "/") return "";
  return `/${String(value).replace(/^\/+|\/+$/g, "")}`;
}

function withBasePath(handler) {
  return (req, res, next) => {
    req.appBasePath = normalizeBasePath(req.params.base ? `/${req.params.base}` : process.env.PASSENGER_BASE_URI);
    Promise.resolve(handler(req, res)).catch(next);
  };
}

function health(_req, res) {
  res.type("text/plain").send("ok");
}

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get(["/health", "/api/health", "/:base/health", "/:base/api/health"], health);
app.get(["/favicon.ico", "/:base/favicon.ico", "/favicon.png", "/:base/favicon.png"], (_req, res) => {
  res.sendFile(path.join(rootDir, "assets", "icons", "dream-ai-favicon.png"));
});

app.get(["/api/config", "/:base/api/config"], withBasePath(configHandler));
app.post(["/api/submit", "/:base/api/submit", "/api/calculate", "/:base/api/calculate"], withBasePath(submitHandler));

app.use((req, _res, next) => {
  req.url = req.url.replace(/^\/[^/]+\/assets\//, "/assets/");
  next();
});

const passengerBasePath = normalizeBasePath(process.env.PASSENGER_BASE_URI);
if (passengerBasePath) {
  app.use(passengerBasePath, express.static(rootDir));
}
app.use(express.static(rootDir));

app.get("/:base", (req, res, next) => {
  if (req.params.base.includes(".")) return next();
  if (req.path.endsWith("/")) return next();
  return res.redirect(301, `/${req.params.base}/`);
});

app.get(["/", "/index.html", "/:base/", "/:base/index.html"], (_req, res) => {
  res.sendFile(path.join(rootDir, "index.html"));
});

app.get(["/result.html", "/:base/result.html"], (_req, res) => {
  res.sendFile(path.join(rootDir, "result.html"));
});

function startServer() {
  if (app.locals.started) return app.locals.server;
  const port = Number(process.env.PORT || process.env.NODE_PORT || 3000);
  app.locals.server = app.listen(port, () => {
    console.log(`Customer Flow Diagnostic listening on port ${port}`);
  });
  app.locals.started = true;
  return app.locals.server;
}

if (require.main === module || process.env.PASSENGER_APP_ENV || process.env.PASSENGER_BASE_URI) {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;
module.exports.normalizeBasePath = normalizeBasePath;
