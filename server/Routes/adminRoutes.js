const app = require("express");
const Router = app.Router();
const authenticateToken = require("../Middleware/middleware");
const { auth, register, addRep } = require("../Controllers/adminController");

Router.post("/login", auth);
Router.post("/register", register);
Router.post("/add-rep", authenticateToken, addRep);

module.exports = Router;
