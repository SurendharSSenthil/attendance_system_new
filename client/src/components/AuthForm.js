import React from 'react';
import { Button, Form, Input, Card, message } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { url } from '../Backendurl';

export const AuthForm = ({ setAuth, setUser }) => {
    const navigate = useNavigate();

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const onFinish = async (values) => {
        try {
            if (values.username === "" || values.password === "") {
                message.error("Please enter the username and password!");
            } else {
                const res = await fetch(`${url}/admin/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(values)
                });
                const data = await res.json();
                console.log(data);
                if (res.ok) {
                    // If authentication is successful, set the JWT token in localStorage
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', data.user);
                    message.success("Logged in successfully");
                    // Update the state to indicate that the user is authenticated
                    setAuth(true);
                    setUser(data.user);
                    console.log("@AuthForm", data.user);
                    // Navigate to the Home page
                    navigate('/');
                } else {
                    // If authentication fails, display an error message
                    message.error(data.message || "Authentication failed");
                    // Update the state to indicate that the user is not authenticated
                    setAuth(false);
                }
            }
        } catch (err) {
            message.error("Wrong Details");
        }
    };

    return (
        <div className="flex justify-center items-center h-full p-4 " style={{ marginTop: "250px" }}>
            <Card className="shadow-lg" style={{ width: '400px' }}>
                <h2 className='text-base sm:text-lg font-bold text-brown-900 pb-4 font-sans' style={{ textAlign: "Center" }}><LoginOutlined />Sign In</h2>
                <Form
                    name="basic"
                    labelCol={{
                        span: 8,
                    }}
                    wrapperCol={{
                        span: 16,
                    }}
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your username!',
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
                                message: 'Please input your password!',
                            },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        wrapperCol={{
                            offset: 8,
                            span: 16,
                        }}
                    >
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AuthForm;
