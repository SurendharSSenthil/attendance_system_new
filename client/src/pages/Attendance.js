import React, { useState, useEffect } from "react";
import {
	Card,
	Row,
	Col,
	DatePicker,
	Select,
	Alert,
	Statistic,
	message,
} from "antd";
import moment from "moment";
import AttendanceTable from "../components/AttendanceTable";
import { url } from "../Backendurl";

const Attendance = () => {
	const currentDate = moment().format("YYYY-MM-DD");
	const [currDate, setCurrDate] = useState(moment(currentDate, "YYYY-MM-DD"));
	const [data, setData] = useState([]);
	const [courses, setCourses] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [hr, setHr] = useState(1);
	const [course, setCourse] = useState("");
	const [yr, setYr] = useState("");
	const [Class, setClass] = useState("");
	const [yrs, setYrs] = useState([]);
	const [Classes, setClasses] = useState([]);
	const [absent, setAbsent] = useState(0);
	const [count, setCount] = useState(0);

	const handleDateChange = (date, dateString) => {
		setCurrDate(moment(dateString, "YYYY-MM-DD"));
	};

	const handleHrChange = (value) => {
		setHr(value);
	};

	const handleCourseChange = (value) => {
		setCourse(value);
	};

	const fetchCourses = async () => {
		setLoading(true);
		try {
			const coursesResponse = await fetch(`${url}/students/faculty-data`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});
			const coursesData = await coursesResponse.json();
			setCourses(Array.isArray(coursesData.course) ? coursesData.course : []);
			setYrs(Array.isArray(coursesData.yr) ? coursesData.yr : []);
			setClasses(Array.isArray(coursesData.dept) ? coursesData.dept : []);
		} catch (err) {
			setError("Failed to fetch courses. Please try again.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const fetchAttendance = async () => {
		if (!course || !Class || !yr || !currDate || !hr) {
			message.error("Please select the fields.");
			return;
		}
		setData([]);
		setCount(0);
		setAbsent(0);
		setLoading(true);
		try {
			const response = await fetch(`${url}/attendance/get-attendance`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({
					date: currDate.format("YYYY-MM-DD"),
					coursecode: course,
					coursename: course,
					hr,
					yr,
					Class,
				}),
			});
			const result = await response.json();
			if (response.ok) {
				setData(result.reports);
				setAbsent(result.absentees);
				setCount(result.count);
				setError(null);
			} else {
				message.error(`${result.message}`);
			}
		} catch (err) {
			message.error("An error occurred while fetching attendance data.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCourses();
	}, []);

	useEffect(() => {
		document.title = "ATTENDANCE SYSTEM";
	}, []);

	return (
		<div>
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} md={8}>
					<Card>
						<p className="text-gray-500 mb-2">
							<span className="text-red-500">* </span>Select the Date
						</p>
						<DatePicker
							onChange={handleDateChange}
							disabledDate={(current) =>
								current && current > moment().endOf("day")
							}
							// value={currDate}
							format="YYYY-MM-DD"
							className="w-full"
							// getPopupContainer={(trigger) => trigger.parentNode}
						/>{" "}
					</Card>
				</Col>
				<Col xs={24} sm={12} md={8}>
					<Card>
						<p className="text-gray-500 mb-2">
							<span className="text-red-500">* </span>Select the Hour
						</p>
						<Select
							onChange={handleHrChange}
							value={hr}
							options={Array.from({ length: 8 }, (_, i) => ({
								label: `${i + 1}`,
								value: i + 1,
							}))}
							className="w-full"
						/>
					</Card>
				</Col>
				{courses.length > 0 && (
					<Col xs={24} sm={12} md={8}>
						<Card>
							<p className="text-gray-500 mb-2">
								<span className="text-red-500">* </span>Select the Course
							</p>
							<Select
								onChange={handleCourseChange}
								value={course}
								options={courses.map((course) => ({
									label: `${course.coursename} - ${course.coursecode}`,
									value: course.coursecode,
								}))}
								className="w-full"
							/>
						</Card>
					</Col>
				)}
				<Col xs={24} sm={12} md={8}>
					<Card>
						<p className="text-gray-500 mb-2">
							<span className="text-red-500">* </span>Select the Year
						</p>
						<Select
							onChange={(e) => setYr(e)}
							value={yr}
							options={yrs.map((year) => ({
								label: year,
								value: year,
							}))}
							className="w-full"
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} md={8}>
					<Card>
						<p className="text-gray-500 mb-2">
							<span className="text-red-500">* </span>Select the Class
						</p>
						<Select
							onChange={(e) => setClass(e)}
							value={Class}
							options={Classes.map((c) => ({
								label: c,
								value: c,
							}))}
							className="w-full"
						/>
					</Card>
				</Col>
			</Row>
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} md={8} className="md:mt-4">
					<button
						type="button"
						onClick={fetchAttendance}
						className="relative py-0 px-4 h-10 mt-4 lg:mt-0 rounded-lg transition-all duration-300 bg-blue-500 text-white border-2 border-blue-500 hover:bg-white hover:text-blue-500 hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/50  outline-none flex flex-row justify-center items-center font-semibold w-full"
					>
						Get Data
					</button>
				</Col>
			</Row>
			<Card style={{ marginTop: "16px" }}>
				{error ? (
					<Alert message={error} type="error" />
				) : (
					<AttendanceTable
						currDate={currDate.format("YYYY-MM-DD")}
						data={data}
						setData={setData}
						setLoading={setLoading}
						loading={loading}
						hr={hr}
						course={course}
						yr={yr}
						Class={Class}
						fetchAttendance={fetchAttendance}
					/>
				)}
			</Card>
			{count > 0 && (
				<Row gutter={16} className="mt-8">
					<Col xs={24} sm={12} md={12} lg={12}>
						<Card bordered={false}>
							<Statistic
								title="Total Number of Students"
								value={count}
								valueStyle={{
									color: "#3f8600",
								}}
							/>
						</Card>
					</Col>
					<Col xs={24} sm={12} md={12} lg={12} className="mt-4 md:mt-0">
						<Card bordered={false}>
							<Statistic
								title="Number of Absentees"
								value={absent}
								valueStyle={{
									color: "#cf1322",
								}}
							/>
						</Card>
					</Col>
				</Row>
			)}
		</div>
	);
};

export default Attendance;
