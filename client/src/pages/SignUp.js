import React, { useEffect } from "react";
// import { AuthForm } from "../components/AuthForm";
import { useNavigate } from "react-router-dom";
import { url } from "../Backendurl";
import { message, Button, Form, Input, Card } from "antd";
import { LoginOutlined } from "@ant-design/icons";

const Auth = ({ setAuth, setUser }) => {
	const navigate = useNavigate();

	const onFinishFailed = (errorInfo) => {
		console.log("Failed:", errorInfo);
	};

	const onFinish = async (values) => {
		try {
			if (values.username === "" || values.password === "") {
				message.error("Please enter the username and password!");
			} else {
				const res = await fetch(`${url}/admin/register`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(values),
				});
				const data = await res.json();
				console.log(data);
				if (res.ok) {
					// If authentication is successful, set the JWT token in localStorage
					localStorage.setItem("token", data.token);
					localStorage.setItem("user", data.user);
					message.success("Logged in successfully");
					// Update the state to indicate that the user is authenticated
					setAuth(true);
					setUser(data.user);
					console.log("@AuthForm", data.user);
					// Navigate to the Home page
					navigate("/register-faculty");
				} else {
					// If authentication fails, display an error message
					message.error(data.message || "Authentication failed");
					values.username = "";
					values.password = "";
					// Update the state to indicate that the user is not authenticated
					setAuth(false);
				}
			}
		} catch (err) {
			message.error("Wrong Details");
		}
	};
	useEffect(() => {
		document.title = "ATTENDANCE SYSTEM | REGISTER";
	});
	return (
		<div className="flex justify-center items-center min-h-screen p-4 overflow-x-hidden">
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
					Sign Up
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

					<div className="text-center">
						<a href="/auth" className="text-blue-500">
							Already have an account? Login here!
						</a>
					</div>

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

export default Auth;
