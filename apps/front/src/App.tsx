import "./App.css";
import Navbar from "./main-page/Navbar/Navbar";
import Background from "./main-page/Background/Background";
import { AppState } from "./reducers";
import { useSelector } from "react-redux";
import { socket } from "./socket";
import { useEffect } from "react";
import { addModal, ModalType } from "./shared/utils/AddModal";
import { useNavigate } from "@tanstack/react-router";

export const useDetectBackNavigation = (targetPath) => {
	const navigate = useNavigate();

	useEffect(() => {
		const handleBackNavigation = () => {
			navigate({ to: targetPath });
		};

		window.addEventListener("popstate", handleBackNavigation);

		return () => {
			window.removeEventListener("popstate", handleBackNavigation);
		};
	}, [navigate, targetPath]);
};

function App() {
	useDetectBackNavigation("/auth");

	useEffect(() => {
		socket.auth = { token: localStorage.getItem("token") };
		socket.connect();

		socket.on("connect", () => {});

		socket.on("connect_failed", () => {
			addModal(
				ModalType.ERROR,
				`Socket connection failed. Please try logging in again.`,
				"logOut"
			);
		});

		socket.on("disconnect", (reason) => {
			console.log("Disconnected : " + reason);
		});

		return () => {
			socket.disconnect();
			socket.off("connect");
			socket.off("disconnect");
		};
	}, []);

	const { displayFilter, zIndexFilter } = useSelector(
		(state: AppState) => {
			const modalWindow = state.windows.find(
				(window) =>
					window.content.type === "MODAL" ||
					window.content.type === "MODALREQUESTED"
			);

			if (modalWindow) {
				return {
					displayFilter: "block",
					zIndexFilter: modalWindow.zindex || 0,
				};
			} else {
				return {
					displayFilter: "none",
					zIndexFilter: 0,
				};
			}
		},
		(prev, next) =>
			prev.displayFilter === next.displayFilter &&
			prev.zIndexFilter === next.zIndexFilter
	);
	return (
		<div className="App">
			<div
				className="Filter"
				style={{ display: displayFilter, zIndex: zIndexFilter }}
			></div>
			<Navbar />
			<Background />
		</div>
	);
}

export default App;
