const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
	{
		coursename: {
			type: String,
			required: true,
		},
		coursecode: {
			type: String,
			required: true,
		},
		timetable: {
			type: Object,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = admin = mongoose.model("timetable", timetableSchema);
