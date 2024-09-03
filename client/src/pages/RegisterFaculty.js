import React, { useState } from "react";
import { Button, Form, Input, Card, message, Upload, Row, Col } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { url } from "../Backendurl";
import { useNavigate } from "react-router-dom";

const RegisterFaculty = () => {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [fileList, setFileList] = useState([]);
	const navigate = useNavigate();

	const handleSubmit = async (values) => {
		const {
			coursename,
			coursecode,
			facname,
			year,
			class: courseClass,
		} = values;
		const file = fileList[0];

		if (!file) {
			message.error("Please upload a CSV file!");
			return;
		}

		const formData = new FormData();
		formData.append("coursename", coursename);
		formData.append("coursecode", coursecode);
		formData.append("facname", facname);
		formData.append("year", year);
		formData.append("class", courseClass);
		formData.append("file", file.originFileObj);

		try {
			setLoading(true);
			const response = await fetch(`${url}/students/create-course`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			const data = await response.json();
			message.success("Course registered successfully!");
			form.resetFields();
			setFileList([]);
			navigate("/attendance");
		} catch (error) {
			message.error("There was an error processing your request.");
			console.error("Fetch error: ", error);
		} finally {
			setLoading(false);
		}
	};

	const handleFileChange = ({ fileList }) => setFileList(fileList);

	return (
		<div className="bg-gray-100 flex flex-col justify-center items-center min-h-screen p-4">
			<Card
				bordered={false}
				className="w-full max-w-2xl shadow-lg rounded-lg bg-white"
			>
				<h2 className="text-center text-2xl font-bold text-gray-800 mb-6">
					Faculty Course Registration
				</h2>
				<Form
					form={form}
					onFinish={handleSubmit}
					layout="vertical"
					className="space-y-4"
				>
					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item
								label="Faculty Name"
								name="facname"
								rules={[
									{
										required: true,
										message: "Please input the faculty name!",
									},
								]}
							>
								<Input placeholder="Enter faculty name" />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item
								label="Course Name"
								name="coursename"
								rules={[
									{
										required: true,
										message: "Please input the course name!",
									},
								]}
							>
								<Input placeholder="Enter course name" />
							</Form.Item>
						</Col>
					</Row>
					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item
								label="Course Code"
								name="coursecode"
								rules={[
									{
										required: true,
										message: "Please input the course code!",
									},
								]}
							>
								<Input placeholder="Enter course code" />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item
								label="Year"
								name="year"
								rules={[
									{
										required: true,
										message: "Please input the year!",
									},
								]}
							>
								<Input placeholder="Enter year" />
							</Form.Item>
						</Col>
					</Row>
					<Form.Item
						label="Class"
						name="class"
						rules={[
							{
								required: true,
								message: "Please input the class!",
							},
						]}
					>
						<Input placeholder="Enter class" />
					</Form.Item>
					<Form.Item
						label="Upload CSV containing RegNo and StdName"
						rules={[
							{
								required: true,
								message: "Please upload a CSV file!",
							},
						]}
						className="text-wrap"
					>
						<Upload
							accept=".csv"
							fileList={fileList}
							beforeUpload={() => false} // Prevent automatic upload
							onChange={handleFileChange}
							className="w-full"
						>
							<Button icon={<UploadOutlined />}>Select File</Button>
						</Upload>
					</Form.Item>
					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							loading={loading}
							block
							className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
						>
							Submit
						</Button>
					</Form.Item>
				</Form>
			</Card>
		</div>
	);
};

export default RegisterFaculty;
