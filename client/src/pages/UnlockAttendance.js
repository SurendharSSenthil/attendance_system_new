import { UnlockOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import {
	Card,
	Select,
	Row,
	Col,
	message,
	Spin,
	Table,
	notification,
} from "antd";
import moment from "moment";
import { url } from "../Backendurl";

const UnlockAttendance = () => {
	const [courses, setCourses] = useState([]);
	const [coursecode, setCoursecode] = useState("");
	const [loading, setLoading] = useState(false);
	const [yrs, setYrs] = useState([]);
	const [classes, setClasses] = useState([]);
	const [yr, setYr] = useState();
	const [dept, setDept] = useState("");
	const [data, setData] = useState([]);

	useEffect(() => {
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
				message.error("Failed to fetch courses. Please try again.");
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchCourses();
	}, []);

	const fetchReport = async () => {
		setLoading(true);
		if (coursecode === "" || yr === "" || dept === "") {
			message.error("Please select all the fields!");
			setLoading(false);
			return;
		}
		try {
			const response = await fetch(`${url}/attendance/student-dashboard`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ coursecode, yr, Class: dept }),
			});
			const data = await response.json();
			if (response.ok) {
				setData(data);
			} else {
				message.error(data.message || "Network error. Please try again.");
			}
		} catch (err) {
			message.error("Error occurred. Please try again.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleUnfreeze = async (date, hour) => {
		try {
			const response = await fetch(`${url}/students/unfreeze`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({ coursecode, hour, date }),
			});

			if (!response.ok) {
				throw new Error(`Error: ${response.status}`);
			}
			// console.log(res);
			message.success(
				`Attendance unlocked for ${moment(date).format(
					"YYYY-MM-DD"
				)}- hour ${hour}.`
			);
			console.log(
				`Unfreeze clicked for date: ${date.toLocaleString()}, hour: ${hour}`
			);
		} catch (Err) {
			message.error("Error occured. Please try again");
		}
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
	];

	if (data.length > 0 && data[0]?.courses[0]?.statuses?.length > 0) {
		data[0].courses[0].statuses.forEach((status, index) => {
			columns.push({
				title: (
					<button
						onClick={() => handleUnfreeze(status.date, status.hour)}
						className="text-blue-500 underline"
					>
						Unfreeze Hour {status.hour} (
						{moment(status.date).format("YYYY-MM-DD")})
					</button>
				),
				key: `hour_${index + 1}`,
				render: (_, record) => {
					const courseData = record.courses[0];
					if (courseData) {
						const statusValue = courseData?.statuses[index]?.status;
						if (statusValue === 1) {
							return "P";
						} else if (statusValue === 2) {
							return <span className="text-yellow-500 font-semibold">OD</span>;
						} else {
							return <span className="text-red-500 font-semibold">AB</span>;
						}
					} else {
						return "-";
					}
				},
			});
		});
	}

	return (
		<div>
			<h2 className="block text-lg text-gray-700 font-semibold mb-4">
				<UnlockOutlined /> Unlock Attendance
			</h2>
			<Row gutter={[16, 16]}>
				{courses.length > 0 && (
					<Col xs={24} sm={12} md={8}>
						<Card>
							<p className="text-gray-500 mb-2">
								<span className="text-red-500">* </span>Select the Course
							</p>
							<Select
								onChange={(v) => setCoursecode(v)}
								value={coursecode}
								options={courses.map((course) => ({
									label: `${course.coursename} - ${course.coursecode}`,
									value: course.coursecode,
								}))}
								className="w-full"
							/>
						</Card>
					</Col>
				)}
				{yrs.length > 0 && (
					<Col xs={24} sm={12} md={8}>
						<Card>
							<p className="text-gray-500 mb-2">
								<span className="text-red-500">* </span>Select the Year
							</p>
							<Select
								onChange={(v) => setYr(v)}
								value={yr}
								options={yrs.map((y) => ({
									label: `${y}`,
									value: y,
								}))}
								className="w-full"
							/>
						</Card>
					</Col>
				)}
				{classes.length > 0 && (
					<Col xs={24} sm={12} md={8}>
						<Card>
							<p className="text-gray-500 mb-2">
								<span className="text-red-500">* </span>Select the Class
							</p>
							<Select
								onChange={(v) => setDept(v)}
								value={dept}
								options={classes.map((cls) => ({
									label: `${cls}`,
									value: cls,
								}))}
								className="w-full"
							/>
						</Card>
					</Col>
				)}
			</Row>
			<Row gutter={[16, 16]} className="mt-4">
				<Col xs={24} sm={12} md={8}>
					<button
						type="button"
						onClick={fetchReport}
						className="relative py-0 px-4 h-10 mt-4 lg:mt-0 rounded-lg transition-all duration-300 bg-blue-500 text-white border-2 border-blue-500 hover:bg-white hover:text-blue-500 hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/50  outline-none flex flex-row justify-center items-center font-semibold w-full"
					>
						Get Data
					</button>
				</Col>
			</Row>
			<Row>
				{loading ? (
					<Spin tip="Loading..." />
				) : data.length > 0 ? (
					<div className="flex flex-col gap-4">
						<Table
							dataSource={data}
							columns={columns}
							pagination={false}
							className="overflow-x-auto bg-white"
						/>
					</div>
				) : null}
			</Row>
		</div>
	);
};

export default UnlockAttendance;
