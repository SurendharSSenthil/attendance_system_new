const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema(
	{
		coursename: {
			type: String,
			required: true,
		},
		coursecode: {
			type: String,
			required: true,
			unique: true,
		},
		dept: {
			type: String,
			required: true,
		},
		yr: {
			type: Number,
			required: true,
		},
		timetable: {
			monday: { type: [Number], default: [] },
			tuesday: { type: [Number], default: [] },
			wednesday: { type: [Number], default: [] },
			thursday: { type: [Number], default: [] },
			friday: { type: [Number], default: [] },
		},
	},
	{
		timestamps: true,
	}
);

const TimetableModel = mongoose.model('Timetable', TimetableSchema);
module.exports = TimetableModel;
