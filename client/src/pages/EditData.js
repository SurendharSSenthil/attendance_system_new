import { useEffect, useState } from "react";
import {
	Table,
	Button,
	message,
	Row,
	Col,
	Card,
	Select,
	Modal,
	Form,
	Input,
} from "antd";
import { DeleteTwoTone, EditOutlined } from "@ant-design/icons";
import { url } from "../Backendurl";

const EditData = ({ setAuth, user }) => {
	const [courses, setCourses] = useState([]);
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState([]);
	const [coursecode, setCoursecode] = useState("");
	const [modal, showModal] = useState(false);
	const [modal2, showModal2] = useState(false);
	const [addcourse, setAddCourse] = useState("");
	const [count, setCount] = useState(0);
	const [form] = Form.useForm();
	const [form2] = Form.useForm();

	// Fetch courses when the component mounts
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
			} catch (err) {
				message.error("Failed to fetch courses. Please try again.");
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchCourses();
	}, []);

	// Fetch students for the selected course
	const fetchStudents = async () => {
		if (coursecode === "") {
			message.error("Please select a course!");
			return;
		}
		try {
			const response = await fetch(`${url}/students/${coursecode}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});

			if (!response.ok) {
				throw new Error(`Error: ${response.status}`);
			}

			const studentsData = await response.json();
			setData(studentsData);
			setCount(studentsData.length);
		} catch (error) {
			console.error("Error fetching students:", error);
			message.error("Failed to fetch student data. Please try again.");
		}
	};

	// Delete student
	const deleteStudent = async (RegNo) => {
		try {
			const response = await fetch(`${url}/students/delete-student`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({ coursecode, RegNo }),
			});

			if (!response.ok) {
				throw new Error(`Error: ${response.status}`);
			}

			message.success("Student deleted successfully.");
			fetchStudents();
		} catch (error) {
			console.error("Error deleting student:", error);
			message.error("Failed to delete student. Please try again.");
		}
	};

	// Handle form submission for adding a student
	const onFinish = async (values) => {
		try {
			const response = await fetch(`${url}/students/add-student`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({ ...values, coursecode: addcourse }),
			});

			if (!response.ok) {
				throw new Error(`Error: ${response.status}`);
			}

			const result = await response.json();
			message.success(result.message);
			showModal(false);
			form.resetFields();
			fetchStudents();
		} catch (err) {
			console.error("Error adding student:", err);
			message.error("Failed to add student. Please check the details.");
		}
	};

	const onFinishAdmin = async (values) => {
		try {
			const response = await fetch(`${url}/admin/add-rep`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({ ...values, coursecode: addcourse }),
			});

			if (!response.ok) {
				throw new Error(`Error: ${response.status}`);
			}

			const result = await response.json();
			message.success(result.message);
			showModal2(false);
			form2.resetFields();
			// fetchStudents();
		} catch (err) {
			console.error("Error adding Admin:", err);
			message.error("Failed to add admin. Please check the details.");
		}
	};

	const columns = [
		{
			title: "Registration Number",
			dataIndex: "RegNo",
			key: "RegNo",
		},
		{
			title: "Name",
			dataIndex: "StdName",
			key: "StdName",
		},
		{
			title: "Remove Student",
			key: "action",
			render: (text, record) => (
				<Button type="danger" onClick={() => deleteStudent(record.RegNo)}>
					<DeleteTwoTone />
				</Button>
			),
		},
	];

	const addStudent = () => {
		showModal(true);
	};

	const addAdmin = () => {
		showModal2(true);
	};

	return (
		<div className="md:m-2 flex flex-col gap-2 md:block">
			<h2 className="block text-lg text-gray-700 font-semibold mb-4">
				<EditOutlined />
				Edit Students Details
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
			</Row>
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} md={8} className="md:mt-4">
					<Button type="primary" onClick={fetchStudents} className="w-full">
						Get Data
					</Button>
				</Col>
			</Row>
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} md={8} className="md:mt-4">
					<Button type="primary" onClick={addStudent} className="w-full">
						Add Student
					</Button>
				</Col>
			</Row>
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} md={8} className="md:mt-4">
					<Button type="primary" onClick={addAdmin} className="w-full">
						Add Admin
					</Button>
				</Col>
			</Row>
			<Row gutter={[16, 16]} className="mt-4">
				<Col span={24}>
					{data.length > 0 && (
						<Table
							columns={columns}
							dataSource={data}
							rowKey="RegNo"
							pagination={false}
							loading={loading}
							className="bg-white overflow-x-auto"
						/>
					)}
				</Col>
			</Row>
			<Row gutter={[16, 16]} className="mt-4">
				<Col span={24}>
					{count > 0 && (
						<Card>
							<p className="text-gray-500 mb-2">Number of Students</p>
							<p className="text-violet-600 font-semibold text-2xl">{count}</p>
						</Card>
					)}
				</Col>
			</Row>
			<Modal
				title="Add Student"
				open={modal}
				onCancel={() => showModal(false)}
				footer={null}
			>
				<Form
					form={form}
					name="add_student"
					onFinish={onFinish}
					autoComplete="off"
				>
					<Form.Item
						label="Student Name"
						name="StdName"
						rules={[
							{
								required: true,
								message: "Please input the student's name!",
							},
						]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						label="Registration Number"
						name="RegNo"
						rules={[
							{
								required: true,
								message: "Please input the registration number!",
							},
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						label="Course"
						name="coursecode"
						rules={[
							{
								required: true,
								message: "Please select the course!",
							},
						]}
					>
						<Select
							onChange={(v) => setAddCourse(v)}
							value={addcourse}
							options={courses.map((course) => ({
								label: `${course.coursename} - ${course.coursecode}`,
								value: course.coursecode,
							}))}
							className="w-full"
						/>
					</Form.Item>

					<Form.Item>
						<Button type="primary" htmlType="submit" className="w-full">
							Add Student
						</Button>
					</Form.Item>
				</Form>
			</Modal>
			<Modal
				title="Add Representative"
				open={modal2}
				onCancel={() => showModal2(false)}
				footer={null}
			>
				<Form
					form={form2}
					name="add_admin"
					onFinish={onFinishAdmin}
					autoComplete="off"
				>
					<Form.Item
						label="User Name"
						name="username"
						rules={[
							{
								required: true,
								message: "Please input the username!",
							},
						]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						label="Password"
						name="password"
						rules={[
							{
								required: true,
								message: "Please input the password!",
							},
						]}
					>
						<Input.Password />
					</Form.Item>
					<Form.Item
						label="Course"
						name="coursecode"
						rules={[
							{
								required: true,
								message: "Please select the course!",
							},
						]}
					>
						<Select
							onChange={(v) => setAddCourse(v)}
							value={addcourse}
							options={courses.map((course) => ({
								label: `${course.coursename} - ${course.coursecode}`,
								value: course.coursecode,
							}))}
							className="w-full"
						/>
					</Form.Item>

					<Form.Item>
						<Button type="primary" htmlType="submit" className="w-full">
							Add Representative
						</Button>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default EditData;
