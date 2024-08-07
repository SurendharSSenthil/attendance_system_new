const admin = require("../Models/adminModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const register = async (req, res) => {
	const data = req.body;
	const username = data.username;
	try {
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

module.exports = {
	auth,
	register,
};
