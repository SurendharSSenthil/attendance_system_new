import React, { useState } from "react";
import { Button, Form, Input, Card, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { url } from "../Backendurl";
import { useNavigate } from "react-router-dom";
// const { RangePicker } = DatePicker;

const formItemLayout = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 6 },
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 14 },
	},
};

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
		<div className="bg-gray-100 flex flex-col justify-center items-center min-h-screen">
			<h2 className="text-slate-500 text-xl font-semibold">
				Faculty Course Registration
			</h2>
			<div style={{ padding: "20px" }}>
				<Card bordered={false}>
					<Form
						{...formItemLayout}
						form={form}
						style={{ maxWidth: 600 }}
						onFinish={handleSubmit}
					>
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
							<Input />
						</Form.Item>
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
							<Input />
						</Form.Item>
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
							<Input />
						</Form.Item>
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
							<Input />
						</Form.Item>
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
							<Input />
						</Form.Item>
						<div className="flex flex-col gap-2">
							<Form.Item
								label="Upload CSV containing RegNo and StdName"
								rules={[
									{
										required: true,
										message: "Please upload a CSV file!",
									},
								]}
								className="text-wrap w-[1200px]"
							>
								<Upload
									accept=".csv"
									fileList={fileList}
									beforeUpload={() => false} // Prevent automatic upload
									onChange={handleFileChange}
								>
									<Button icon={<UploadOutlined />}>Select File</Button>
								</Upload>
							</Form.Item>
						</div>
						<Form.Item
							wrapperCol={{
								offset: 6,
								span: 16,
							}}
						>
							<Button type="primary" htmlType="submit" loading={loading}>
								Submit
							</Button>
						</Form.Item>
					</Form>
				</Card>
			</div>
		</div>
	);
};

export default RegisterFaculty;
