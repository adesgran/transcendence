import "./BanList.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../../axios";
import List from "../../../../shared/ui-components/List/List";
import { FaSpinner } from "react-icons/fa";
import { Button } from "../../../../shared/ui-components/Button/Button";
import { ReducedUser } from "../../../../shared/ui-components/User/User";
import store from "../../../../store";
import { delWindow } from "../../../../reducers";

interface BanListProps {
	channelId: number;
	winId: number;
}

export function BanList({ channelId, winId }: BanListProps) {
	const queryClient = useQueryClient();
	const {
		data: banList,
		isLoading: banListLoading,
		error: banListError,
	} = useQuery<
		{
			id: number;
			username: string;
		}[]
	>({
		queryKey: ["banList", channelId],
		queryFn: async () => {
			try {
				const response = await api.get(`/banList/${channelId}`);
				return response.data;
			} catch (error) {
				store.dispatch(delWindow(winId));
			}
		},
	});

	const { mutateAsync: unbanUser } = useMutation({
		mutationFn: async (targetId: number) => {
			return api.patch("/user-channel/moderate/unban", {
				data: { targetId, channelId },
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["chanAbout", channelId],
			});
			queryClient.invalidateQueries({
				queryKey: ["banList", channelId],
			});
			queryClient.invalidateQueries({
				queryKey: ["users", channelId],
			});
		},
	});

	if (banListLoading) {
		return <FaSpinner className="loadingSpinner" />;
	}

	if (banListError) {
		return <div>Error loading users: {banListError.message}</div>;
	}

	const handleUnban = (targetId: number) => {
		unbanUser(targetId);
	};

	if (!Array.isArray(banList)) {
		return (
			<div className="BanListComponent">
				<div className="Body">
					<List>
						<div></div>
					</List>
				</div>
			</div>
		);
	}

	return (
		<div className="BlockedUsersComponent">
			<div className="Body">
				<List>
					{banList?.map((user, key) => (
						<ReducedUser key={key} userId={user.id}>
							<Button
								icon="Unblock"
								color="purple"
								onClick={() => handleUnban(user.id)}
							/>
						</ReducedUser>
					))}
				</List>
			</div>
		</div>
	);
}
