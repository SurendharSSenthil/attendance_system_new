import React, { useState } from "react";
import { Button, Form, Input, Upload, message, Steps } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import "./stepForm.css";
import { url } from "../Backendurl.js";

const { Step } = Steps;

const RegisterFaculty = () => {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [fileList, setFileList] = useState([]);
	const [currentStep, setCurrentStep] = useState(0);
	const [formData, setFormData] = useState({});
	const navigate = useNavigate();

	const steps = [
		{
			title: "Faculty Info",
			content: (
				<>
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
				</>
			),
		},
		{
			title: "Course Info",
			content: (
				<>
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
				</>
			),
		},
		{
			title: "Class & File",
			content: (
				<>
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
					>
						<Upload
							accept=".csv"
							fileList={fileList}
							beforeUpload={() => false} // Prevent automatic upload
							onChange={({ fileList }) => setFileList(fileList)}
						>
							<Button icon={<UploadOutlined />}>Select File</Button>
						</Upload>
					</Form.Item>
				</>
			),
		},
	];

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			const file = fileList[0];

			if (!file) {
				message.error("Please upload a CSV file!");
				return;
			}

			// Combine all data
			const finalData = { ...formData, ...values };
			const formDataToSend = new FormData();
			Object.entries(finalData).forEach(([key, value]) => {
				formDataToSend.append(key, value);
			});
			formDataToSend.append("file", file.originFileObj);

			setLoading(true);
			const response = await fetch(`${url}/students/create-course`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: formDataToSend,
			});

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

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

	const next = async () => {
		try {
			const values = await form.validateFields();
			setFormData({ ...formData, ...values });
			setCurrentStep((prev) => prev + 1);
		} catch (errorInfo) {
			console.error("Failed to proceed to next step:", errorInfo);
		}
	};

	const prev = () => {
		setCurrentStep((prev) => prev - 1);
	};

	return (
		<div className="flex flex-col justify-center items-center m-4 bg-gray-100 p-4">
			<div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
				<h2 className="text-slate-800 text-lg font-semibold text-center mb-4">
					Register Course
				</h2>
				<Steps current={currentStep} className="mb-8">
					{steps.map((step, index) => (
						<Step key={index} title={step.title} />
					))}
				</Steps>

				<Form form={form} layout="vertical" className="space-y-4">
					<CSSTransition
						in={currentStep === currentStep}
						timeout={300}
						classNames="fade"
						unmountOnExit
					>
						{steps[currentStep].content}
					</CSSTransition>

					<Form.Item>
						<div className="flex justify-between">
							{currentStep > 0 && (
								<Button onClick={prev} className="mr-2">
									Previous
								</Button>
							)}
							{currentStep < steps.length - 1 && (
								<Button type="primary" onClick={next}>
									Next
								</Button>
							)}
							{currentStep === steps.length - 1 && (
								<Button
									type="primary"
									htmlType="submit"
									loading={loading}
									onClick={handleSubmit}
								>
									Submit
								</Button>
							)}
						</div>
					</Form.Item>
				</Form>
			</div>
		</div>
	);
};

export default RegisterFaculty;
