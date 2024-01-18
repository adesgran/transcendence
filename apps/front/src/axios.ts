import axios from "axios";
import { ModalType, addModal } from "./shared/utils/AddModal";

const api = axios.create({
	baseURL: "/api",
});

api.interceptors.request.use((req) => {
	if (localStorage.getItem("token")) {
		req.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
	}
	return req;
});

api.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error.response.status === 401) {
			addModal(
				ModalType.ERROR,
				`${error.response.status} - ${error.response.statusText}. You will be redirected to the sign in page.`,
				"logOut"
			);
		} else {
			addModal(
				ModalType.ERROR,
				error.response.data?.message
					? `${error.response.data.message}`
					: `${error.response.status} - ${error.response.statusText}`
			);
			throw error;
		}
	}
);

export default api;
