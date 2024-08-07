const app = require("express");
const Router = app.Router();
const { auth, register } = require("../Controllers/adminController");

Router.post("/login", auth);
Router.post("/register", register);

module.exports = Router;
