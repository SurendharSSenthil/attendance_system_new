import React from "react";
import { Layout } from "antd";
import Sidebar from "./components/Sidebar";
import AppHeader from "./components/Header";
import { Outlet } from "react-router-dom";

const { Content, Footer } = Layout;

const HomeLayout = ({ setAuth, user }) => {
	return (
		<Layout style={{ minHeight: "100vh" }}>
			<Sidebar user={user} style={{ position: "fixed" }} />
			<Layout>
				<AppHeader setAuth={setAuth} user={user} />
				<Content style={{ padding: "16px", marginTop: "20px" }}>
					<Outlet />
				</Content>
				<Footer style={{ textAlign: "center" }}>
					©{new Date().getFullYear()}
				</Footer>
			</Layout>
		</Layout>
	);
};

export default HomeLayout;
