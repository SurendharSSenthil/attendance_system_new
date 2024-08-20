import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
	const location = useLocation();
	const [selectedKey, setSelectedKey] = useState(() => {
		if (user?.role === "A") return "2";
		return "1";
	});

	const handleMenuClick = (key) => {
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
		items.push(
			{ key: "2", icon: <UserOutlined />, label: "Profile", path: "/profile" },
			{
				key: "3",
				icon: <DashboardOutlined />,
				label: "Dashboard",
				path: "/dashboard",
			},
			{
				key: "4",
				icon: <PieChartOutlined />,
				label: "Summary",
				path: "/students",
			},
			{ key: "5", icon: <EditOutlined />, label: "Edit-Data", path: "/edit" },
			{
				key: "6",
				icon: <UnlockOutlined />,
				label: "Unlock Attendance",
				path: "/unlock-attendance",
			}
		);
	}

	useEffect(() => {
		const currentPath = location.pathname;
		const currentItem = items.find((item) => item.path === currentPath);
		if (currentItem) {
			setSelectedKey(currentItem.key);
		}
	}, [location]);

	return (
		<Sider
			breakpoint="lg"
			collapsedWidth="0"
			onCollapse={(collapsed) => setCollapsed(collapsed)}
		>
			<div className="demo-logo-vertical" />
			<Menu
				theme="dark"
				mode="inline"
				selectedKeys={[selectedKey]}
				className="sticky top-4"
			>
				{items.map((item) => (
					<Menu.Item key={item.key} icon={item.icon}>
						<Link to={item.path} onClick={() => handleMenuClick(item.key)}>
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
