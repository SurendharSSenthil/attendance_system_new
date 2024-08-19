const admin = require("../Models/adminModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const classmodel = require("../Models/courseModel");

const register = async (req, res) => {
	let data = req.body;
	data["role"] = "A";
	const username = data.username;
	try {
		const User = await admin.find(data);
		if (User) {
			return res.status(400).send({ message: "Username already exists!" });
		}
		// Create a new user
		const user = new admin(data);
		await user.save();

		// Create a JWT token for the newly registered faculty
		const token = jwt.sign(
			{ id: user._id, username: username },
			process.env.JWT_SECRET_KEY,
			{
				expiresIn: "3d",
			}
		);
		console.log("register:", user);
		res.status(201).json({ token: token, user: user });
	} catch (err) {
		console.log("Error occurred @register:", err);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

const auth = async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await admin.findOne({ username });
		if (!user) {
			return res.status(400).json({ message: "invalid username or password" });
		}
		if (user.password != password) {
			return res.status(400).json({ message: "invalid username or password" });
		}
		const token = jwt.sign(
			{ id: user._id, username: username },
			process.env.JWT_SECRET_KEY,
			{
				expiresIn: "3d",
			}
		);
		console.log("@auth:", user);
		return res.status(200).json({ token: token, user: user });
	} catch (err) {
		console.log(err);
		res.status(500).json(err);
	}
};

const addRep = async (req, res) => {
	let data = req.body;
	data["role"] = "U";
	console.log("Received Data:", data, req.user.id);

	try {
		const facultyClasses = await classmodel.find({
			faculty: { $in: [req.user.id] },
		});
		if (facultyClasses.length === 0) {
			return res.status(404).json({ message: "Faculty not found" });
		}
		const existingUser = await admin.findOne({ username: data.username });
		if (existingUser) {
			return res.status(400).json({ message: "Username already exists!" });
		}

		const rep = new admin(data);
		await rep.save();

		await classmodel.updateMany(
			{ faculty: { $in: [req.user.id] }, coursecode: data.coursecode },
			{ $push: { faculty: rep._id } }
		);

		console.log("New Representative Added:", rep);
		return res.status(201).json({ message: "New representative added", rep });
	} catch (err) {
		console.error("Error at creating representative:", err);
		return res.status(500).send("Internal Server Error");
	}
};

module.exports = {
	auth,
	register,
	addRep,
};
