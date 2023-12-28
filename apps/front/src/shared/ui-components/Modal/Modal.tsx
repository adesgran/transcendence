import { ReactNode } from "react";
import "./Modal.css";
import { ModalType, iconsModal } from "../../utils/AddModal";
import { Button } from "../Button/Button";
import store from "../../../store";
import { delWindow } from "../../../reducers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../axios";

interface ModalProps {
	content: ReactNode;
	type?: ModalType;
	winId: number;
	action?: ActionKey;
	targetId?: number;
}

export type ActionKey =
	| "deleteFriendship"
	| "deleteBlockedFriendship"
	| "addBlockedFriendship";

function Modal({ content, type, winId, action, targetId }: ModalProps) {
	const queryClient = useQueryClient();

	const { mutateAsync: deleteFriendship } = useMutation({
		mutationFn: async () => {
			return api.delete("/relationship/friends/" + targetId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["friendship", targetId],
			});
			queryClient.invalidateQueries({
				queryKey: ["friendsList"],
			});
			queryClient.invalidateQueries({
				queryKey: ["user", targetId],
			});
			queryClient.invalidateQueries({
				queryKey: ["pendingRequests"],
			});
		},
	});

	const { mutateAsync: deleteBlockedFriendship } = useMutation({
		mutationFn: async () => {
			return api.delete("/relationship/blocked/" + targetId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["friendship", targetId],
			});
			queryClient.invalidateQueries({
				queryKey: ["blockedUsers"],
			});
			queryClient.invalidateQueries({
				queryKey: ["user", targetId],
			});
			queryClient.invalidateQueries({
				queryKey: ["pendingRequests"],
			});
		},
	});

	const { mutateAsync: addBlockedFriendship } = useMutation({
		mutationFn: async () => {
			return api.post("/block/" + targetId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["friendship", targetId],
			});
			queryClient.invalidateQueries({
				queryKey: ["blockedUsers"],
			});
			queryClient.invalidateQueries({
				queryKey: ["user", targetId],
			});
			queryClient.invalidateQueries({
				queryKey: ["pendingRequests"],
			});
		},
	});

	const actions = {
		deleteFriendship,
		deleteBlockedFriendship,
		addBlockedFriendship,
	};

	const icon = iconsModal[type || "INFO"];

	const handleClose = (winId: number) => {
		store.dispatch(delWindow(winId));
	};

	const handleAction = (winId: number) => {
		if (action && actions[action]) actions[action]();
		handleClose(winId);
	};

	return (
		<div className="Modal">
			<div className="bodyModal">
				{icon}
				<div className="textModal">
					<div className="heading-600">{type}</div>
					<div className="heading-500">{content}</div>
				</div>
			</div>
			<div className="btnModal">
				{type === ModalType.WARNING && (
					<>
						<Button
							color="red"
							content="yes"
							onClick={() => handleAction(winId)}
						/>
						<Button
							color="red"
							content="no"
							onClick={() => handleClose(winId)}
						/>
					</>
				)}
				{type === ModalType.ERROR && (
					<>
						<Button
							color="red"
							content="ok"
							onClick={() => handleClose(winId)}
						/>
					</>
				)}
			</div>
		</div>
	);
}

export default Modal;
