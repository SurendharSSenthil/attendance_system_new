import React from "react";
import { Layout, Menu, Dropdown, Typography } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";

const { Header } = Layout;
const { Text } = Typography;

const AppHeader = ({ setAuth, user }) => {
	const handleLogout = () => {
		console.log(user);
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setAuth(false);
	};

	const menu = (
		<Menu>
			<Menu.Item key="0" onClick={handleLogout}>
				<LogoutOutlined />
				Logout
			</Menu.Item>
		</Menu>
	);

	return (
		<Header className="bg-white flex justify-between items-center h-[60px] w-full fixed p-4 shadow-md z-50">
			<Text className="text-lg font-semibold">Attendance Manager</Text>
			<Dropdown overlay={menu} placement="bottomLeft" arrow trigger={["click"]}>
				<a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
					<UserOutlined className="text-black" style={{ fontSize: "16px" }} />
					{/* <span className="truncate max-w-[150px] text-black">
						{user?.name}
					</span> */}
				</a>
			</Dropdown>
		</Header>
	);
};

export default AppHeader;
