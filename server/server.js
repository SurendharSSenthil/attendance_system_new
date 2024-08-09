const express = require("express");
const cors = require("cors");
const connectDB = require("./Config/db");
const facultyRoutes = require("./Routes/facultyRoutes");
const attendanceRoutes = require("./Routes/attendanceRoutes");
const adminRoutes = require("./Routes/adminRoutes");
require("dotenv").config();

const port = process.env.PORT || 5000;

connectDB();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/students", facultyRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", adminRoutes);

// app.get("/api", console.log("Hello world"));

app.listen(port, () => console.log(`Server started on port ${port}`));
