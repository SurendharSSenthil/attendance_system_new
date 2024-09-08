import React from "react";
import { Layout, Menu, Dropdown, Typography } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
const { Header } = Layout;
const { Text } = Typography;

const AppHeader = ({ setAuth, user }) => {
	const navigate = useNavigate();

	const handleLogout = () => {
		console.log(user);
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setAuth(false);
		navigate("/login"); // Redirect to login page after logout
	};

	const menu = (
		<Menu>
			<Menu.Item
				key="logout"
				onClick={handleLogout}
				className="hover:text-blue-500"
				danger
			>
				<LogoutOutlined />
				Logout
			</Menu.Item>
		</Menu>
	);

	return (
		<Header className="bg-white flex justify-between items-center h-[60px] p-4 shadow-md fixed w-full z-50">
			<h1 className="text-lg font-bold">Attendance Manager</h1>
			<Dropdown
				overlay={menu}
				placement="bottomRight"
				arrow
				trigger={["click"]}
				className="absolute md:right-[215px] right-4"
			>
				<a className="ant-dropdown-link flex items-center">
					<UserOutlined
						className="text-black hover:text-red-500"
						style={{ fontSize: "16px" }}
					/>
					{/* Optionally display user name */}
					{/* <Text className="ml-2 truncate max-w-[150px] text-black">{user?.name}</Text> */}
				</a>
			</Dropdown>
		</Header>
	);
};

export default AppHeader;
