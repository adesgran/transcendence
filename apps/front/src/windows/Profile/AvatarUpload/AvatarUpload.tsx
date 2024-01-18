import "./AvatarUpload.css";
import api from "../../../axios";
import { useState, ChangeEvent } from "react";
import store from "../../../store";
import { delWindow } from "../../../reducers";
import { Button } from "../../../shared/ui-components/Button/Button";
import { ModalType, addModal } from "../../../shared/utils/AddModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AvatarUploadProps {
	winId: number;
	targetId?: number;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ winId, targetId }) => {
	const queryClient = useQueryClient();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const { mutateAsync: uploadAvatar } = useMutation({
		mutationFn: async (formData: FormData) => {
			return api.post("/user/avatar", formData);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["historic", targetId],
			});
			queryClient.invalidateQueries({
				queryKey: ["user", targetId],
			});
			queryClient.invalidateQueries({
				queryKey: ["profile", targetId],
			});
		},
	});

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		setSelectedFile(file || null);
	};

	const handleUpload = async () => {
		try {
			if (selectedFile) {
				const formData = new FormData();
				formData.append("avatar", selectedFile);

				await uploadAvatar(formData);

				store.dispatch(delWindow(winId));
			} else {
				addModal(ModalType.ERROR, "No file selected");
			}
		} catch (error) {
			addModal(ModalType.ERROR, "Error uploading file");
		}
	};

	const handleClose = (winId: number) => {
		store.dispatch(delWindow(winId));
	};

	return (
		<div className="AvatarUploadComponent">
			<label className="Label" htmlFor="fileInput">
				Upload your new Avatar:
			</label>
			<input type="file" accept="image/*" onChange={handleFileChange} />
			{selectedFile ? (
				<img
					className="Avatar"
					src={URL.createObjectURL(selectedFile)}
				/>
			) : (
				<div></div>
			)}

			<div className="Buttons">
				{selectedFile ? (
					<Button
						content="Upload"
						color="purple"
						onClick={() => handleUpload()}
					/>
				) : (
					<div></div>
				)}
				<Button
					content="Cancel"
					color="red"
					onClick={() => handleClose(winId)}
				/>
			</div>
		</div>
	);
};

export default AvatarUpload;
