import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Layout, Menu } from "antd";
import {
	PieChartOutlined,
	CalendarOutlined,
	DashboardOutlined,
	MenuFoldOutlined,
	MenuUnfoldOutlined,
	EditOutlined,
	UnlockOutlined,
	UserOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

const Sidebar = ({ user }) => {
	const [collapsed, setCollapsed] = useState(false);
	const [selectedKey, setSelectedKey] = useState("1");

	const handleMenuClick = (path, key) => {
		setSelectedKey(key);
	};

	const toggleCollapsed = () => {
		setCollapsed(!collapsed);
	};

	const items = [
		{
			key: "1",
			icon: <CalendarOutlined />,
			label: "Attendance",
			path: "/attendance",
		},
	];

	if (user?.role === "A") {
		items.push({
			key: "2",
			icon: <UserOutlined />,
			label: "Profile",
			path: "/profile",
		});
		items.push({
			key: "3",
			icon: <DashboardOutlined />,
			label: "Dashboard",
			path: "/Dashboard",
		});
		items.push({
			key: "4",
			icon: <PieChartOutlined />,
			label: "Summary",
			path: "/students",
		});
		items.push({
			key: "5",
			icon: <EditOutlined />,
			label: "Edit-Data",
			path: "/edit",
		});
		items.push({
			key: "6",
			icon: <UnlockOutlined />,
			label: "unlock-attendance",
			path: "/unlock-attendance",
		});
	}

	return (
		<Sider
			breakpoint="lg"
			collapsedWidth="0"
			onBreakpoint={(broken) => {
				console.log(broken);
			}}
			onCollapse={(collapsed, type) => {
				console.log(collapsed, type);
				setCollapsed(collapsed);
			}}
		>
			<div className="demo-logo-vertical" />
			{/* <img src={logo} alt='tngov' height='60px' width='60px' className='mx-auto m-4'/> */}
			<Menu
				theme="dark"
				mode="inline"
				defaultSelectedKeys={[selectedKey]}
				className="sticky top-4"
			>
				{items.map((item) => (
					<Menu.Item key={item.key} icon={item.icon}>
						<Link
							to={item.path}
							onClick={() => handleMenuClick(item.path, item.key)}
						>
							{item.label}
						</Link>
					</Menu.Item>
				))}
			</Menu>
			<div
				className="trigger"
				onClick={toggleCollapsed}
				style={{ textAlign: "center", margin: "10px 0" }}
			>
				{collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
			</div>
		</Sider>
	);
};

export default Sidebar;
