import React, { useState, useEffect } from "react";
import { DatePicker, Button, Spin, Alert, Table, Input } from "antd";
import moment from "moment";
import { url } from "../Backendurl";
import { saveAs } from "file-saver";

const Students = () => {
	const [data, setData] = useState([]);
	const [filteredData, setFilteredData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [startDate, setStartDate] = useState(moment().startOf("day"));
	const [endDate, setEndDate] = useState(moment().endOf("day"));
	const [searchText, setSearchText] = useState("");

	const fetchStudentData = async () => {
		setLoading(true);
		try {
			const response = await fetch(
				`${url}/attendance/student-dashboard?startDate=${startDate.format(
					"YYYY-MM-DD"
				)}&endDate=${endDate.format("YYYY-MM-DD")}`
			);
			if (!response.ok) {
				throw new Error("Failed to fetch student data");
			}
			const studentData = await response.json();
			setData(studentData);
			console.log(studentData);
			setFilteredData(studentData);
			setError(null);
		} catch (err) {
			setError("Failed to fetch student data. Please try again.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchStudentData();
	}, [startDate, endDate]);

	useEffect(() => {
		document.title = "ATTENDANCE SYSTEM | STATISTICS";
	});

	useEffect(() => {
		const filtered = data.filter(
			(student) =>
				student.name.toLowerCase().includes(searchText.toLowerCase()) ||
				student.RegNo.toLowerCase().includes(searchText.toLowerCase())
		);
		setFilteredData(filtered);
	}, [searchText, data]);

	const handleDateChange = (dates) => {
		if (dates && dates.length === 2) {
			setStartDate(dates[0]);
			setEndDate(dates[1]);
		} else {
			setStartDate(moment().startOf("day"));
			setEndDate(moment().endOf("day"));
		}
	};

	const exportToCSV = () => {
		const header = [
			"Registration Number",
			"Student Name",
			...data[0].courses.map((course) => course.course),
		];
		const rows = data.map((student) => [
			student.RegNo,
			student.name,
			...student.courses.map((course) =>
				Math.round((course.present * 100) / course.totalHours)
			),
		]);
		const csvContent = [header, ...rows].map((e) => e.join(",")).join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		saveAs(blob, "students_attendance.csv");
	};

	const columns = [
		{
			title: "Registration Number",
			dataIndex: "RegNo",
			key: "RegNo",
			fixed: "left",
		},
		{
			title: "Student Name",
			dataIndex: "name",
			key: "name",
		},
		...(data.length > 0 && data[0].courses
			? data[0].courses.map((course) => ({
					title: course.course,
					dataIndex: course.course,
					key: course.course,
					render: (_, record) => {
						const courseData = record.courses.find(
							(c) => c.course === course.course
						);
						return (
							<span
								className={
									(courseData.present * 100) / courseData.totalHours < 75
										? "text-red-400"
										: ""
								}
							>
								{courseData
									? Math.round(
											(courseData.present * 100) / courseData.totalHours
									  )
									: 0}
							</span>
						);
					},
			  }))
			: []),
	];

	return (
		<div className="p-4 overflow-x-hidden">
			<p className="block text-lg text-gray-700">
				<span className="text-red-500 font-semibold">*</span>Select the date
				range to get the summary of the students attendance report
			</p>
			<br />
			<div className="mb-4 flex flex-col justify-start md:flex-row md:justify-evenly gap-2 md:gap-4">
				<DatePicker.RangePicker
					onChange={handleDateChange}
					defaultValue={[moment().startOf("day"), moment().endOf("day")]}
					className="w-full md:w-[400px]"
				/>
				<Button type="primary" onClick={fetchStudentData}>
					Fetch Data
				</Button>
				<Input.Search
					placeholder="Search by name or register number"
					onChange={(e) => setSearchText(e.target.value)}
					className="rounded-3xl text-gray-600"
				/>
			</div>
			{loading ? (
				<Spin tip="Loading..." />
			) : error ? (
				<Alert message={error} type="error" />
			) : filteredData.length > 0 ? (
				<div className="flex flex-col gap-4">
					<Table
						dataSource={filteredData}
						columns={columns}
						rowClassName={(record, index) =>
							index % 2 === 0 ? "bg-gray-50" : "bg-white"
						}
						pagination={false}
						className="overflow-auto"
					/>
					<Button type="primary" className="w-32" onClick={exportToCSV}>
						Export to CSV
					</Button>
				</div>
			) : null}
		</div>
	);
};

export default Students;
