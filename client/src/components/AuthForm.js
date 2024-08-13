import React from "react";
import { Button, Form, Input, Card, message } from "antd";
import { LoginOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { url } from "../Backendurl";

export const AuthForm = ({ setAuth, setUser }) => {
	const navigate = useNavigate();

	const onFinishFailed = (errorInfo) => {
		console.log("Failed:", errorInfo);
	};

	const onFinish = async (values) => {
		try {
			if (!values.username || !values.password) {
				message.error("Please enter both username and password!");
				return;
			}

			const res = await fetch(`${url}/admin/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});

			const data = await res.json();

			if (res.ok) {
				// Successful login
				localStorage.setItem("token", data.token);
				localStorage.setItem("user", JSON.stringify(data.user));
				message.success("Logged in successfully");
				setAuth(true);
				setUser(data.user);
				navigate("/");
			} else {
				// Authentication failed
				message.error(data.message || "Authentication failed");
				setAuth(false);
				values.username = "";
				values.password = "";
				// console.log(values.username);
				// console.log(values.password);
			}
		} catch (err) {
			message.error("An error occurred. Please try again.");
			console.error("Login error:", err);
		}
	};

	return (
		<div className="flex justify-center items-center min-h-screen p-4">
			<Card className="shadow-lg" style={{ width: "100%", maxWidth: "400px" }}>
				<h2
					className="text-center font-bold text-lg text-brown-900 pb-4"
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<LoginOutlined style={{ marginRight: "8px" }} />
					Sign In
				</h2>
				<Form
					name="basic"
					labelCol={{ span: 8 }}
					wrapperCol={{ span: 16 }}
					initialValues={{ remember: true }}
					onFinish={onFinish}
					onFinishFailed={onFinishFailed}
					autoComplete="off"
				>
					<Form.Item
						label="Username"
						name="username"
						rules={[{ required: true, message: "Please input your username!" }]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						label="Password"
						name="password"
						rules={[{ required: true, message: "Please input your password!" }]}
					>
						<Input.Password />
					</Form.Item>

					{/* <div className="text-center">
						<a href="/register" className="text-blue-500">
							Don't have an account? Sign up here!
						</a>
					</div> */}

					<Form.Item wrapperCol={{ span: 24 }} className="mt-4">
						<Button type="primary" htmlType="submit" block>
							Submit
						</Button>
					</Form.Item>
				</Form>
			</Card>
		</div>
	);
};

export default AuthForm;
