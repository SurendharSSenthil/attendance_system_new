import React from "react";
import { Layout, Menu, Dropdown, Typography } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
const { Header } = Layout;
const { Text } = Typography;

const AppHeader = ({ setAuth, user }) => {
	const handleLogout = () => {
		console.log(user);
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setAuth(false);
	};
	const navigate = useNavigate();
	const menu = (
		<Menu>
			<Menu.Item
				key="0"
				onClick={handleLogout}
				className="hover:text-blue-500"
				danger={true}
			>
				<LogoutOutlined />
				Logout
			</Menu.Item>
		</Menu>
	);

	return (
		<Header className="bg-white flex justify-between items-center h-[60px] p-4 shadow-md z-50">
			<Text className="text-lg font-bold">Attendance Manager</Text>
			<div className="flex flex-row justify-between items-center gap-8">
				{user?.role === "A" && (
					<button
						type="button"
						onClick={() => navigate("/register-faculty")}
						className="relative py-0 px-4 h-10 rounded-lg transition-all duration-300 bg-blue-500 text-white border-2 border-blue-500 hover:bg-white hover:text-blue-500 hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/50 focus:bg-white focus:text-blue-500 focus:border-blue-500 focus:shadow-md focus:shadow-blue-500/50 outline-none flex flex-row justify-center items-center font-semibold"
					>
						+ Course
					</button>
				)}
				<Dropdown
					overlay={menu}
					placement="bottomLeft"
					arrow
					trigger={["click"]}
				>
					<a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
						<UserOutlined
							className="text-black hover:text-red-500"
							style={{ fontSize: "16px" }}
						/>
						{/* <span className="truncate max-w-[150px] text-black">
						{user?.name}
					</span> */}
					</a>
				</Dropdown>
			</div>
		</Header>
	);
};

export default AppHeader;
