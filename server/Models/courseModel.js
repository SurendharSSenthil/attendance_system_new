const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
	coursename: {
		type: String,
		required: true,
	},
	coursecode: {
		type: String,
		required: true,
	},
	faculty: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Admin",
		required: true,
	},
	class: {
		type: String,
		required: true,
	},
	dept: {
		type: String,
		required: true,
	},
	students: [
		{
			type: String,
			required: true,
		},
	],
});

const classmodel = mongoose.model("course", classSchema);

module.exports = classmodel;
