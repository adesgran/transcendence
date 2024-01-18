import "./Background.css";
import { useSelector } from "react-redux";
import { AppState, delWindow } from "../../reducers";
import Window from "../../shared/ui-components/Window/Window";
import Chat, { ChatType } from "../../windows/Chat/Chat";
import Ladder from "../../windows/Ladder/Ladder";
import Profile from "../../windows/Profile/Profile";
import FindChan from "../../windows/Chat/FindChan/FindChan";
import NewChan from "../../windows/Chat/NewChan/NewChan";
import AboutChan from "../../windows/Chat/AboutChan/AboutChan";
import Achievements from "../../windows/Achievements/Achievements";
import FriendsList from "../../windows/Profile/FriendsList/FriendsList";
import Modal from "../../shared/ui-components/Modal/Modal";
import { PendingRequests } from "../../windows/Profile/FriendsList/PendingRequests/PendingRequests";
import { BlockedUsers } from "../../windows/Profile/FriendsList/BlockedUsers/BlockedUsers";
import { AddFriends } from "../../windows/Profile/FriendsList/AddFriends/AddFriends";
import AddMembers from "../../windows/Chat/AboutChan/AddMembers/AddMembers";
import AvatarUpload from "../../windows/Profile/AvatarUpload/AvatarUpload";
import { MemberSettings } from "../../windows/Chat/AboutChan/MemberSettings/MemberSettings";
import ChannelSettings from "../../windows/Chat/AboutChan/ChannelSettings/ChannelSettings";
import { BanList } from "../../windows/Chat/AboutChan/BanList/BanList";
import ChatSession from "../../windows/Chat/ChatSession/ChatSession";
import TwoFA from "../../windows/Profile/Your2FA/Your2FA";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import api from "../../axios";
import store from "../../store";
import MainGameMenu from "../../windows/Play/MainGameMenu/mainGameMenu";
import Preview from "../../windows/Play/Preview/Preview";

enum UserEventType {
  NOEVENT = "NOEVENT",
  FRIENDREQUESTRECEIVED = "FRIENDREQUESTRECEIVED",
  FRIENDSHIPREMOVED = "FRIENDSHIPREMOVED",
  FRIENDREQUESTREVOKED = "FRIENDREQUESTREVOKED",
  FRIENDREQUESTACCEPTED = "FRIENDREQUESTACCEPTED",
  USERBLOCKED = "USERBLOCKED",
  USERUNBLOCKED = "USERUNBLOCKED",
  ADDEDTOCHAN = "ADDEDTOCHAN",
  DEPARTUREFROMCHAN = "DEPARTUREFROMCHAN",
  KICKFROMCHAN = "KICKFROMCHAN",
  BANFROMCHAN = "BANFROMCHAN",
  UNBANFROMCHAN = "UNBANFROMCHAN",
  MUTEINCHAN = "MUTEINCHAN",
  UNMUTEINCHAN = "UNMUTEINCHAN",
  CHANDELETION = "CHANDELETION",
  USERDELETED = "USERDELETED",
  OWNERMADE = "OWNERMADE",
  ADMINMADE = "ADMINMADE",
  DEMOTEADMIN = "DEMOTEADMIN",
}

export default function Background() {
	const queryClient = useQueryClient();

	const windows = useSelector((state: AppState) => state.windows);
	const memoizedWindows = useMemo(() => windows, [windows]);

	interface WindowDimensions {
		width: string;
		height: string;
	}

  const windowDimensions: Record<string, WindowDimensions> = {
    LADDER: { width: "450px", height: "600px" },
    CHAT: { width: "400px", height: "400px" },
    PROFILE: { width: "500px", height: "500px" },
    FINDCHAN: { width: "400px", height: "400px" },
    NEWCHAN: { width: "420px", height: "400px" },
    ABOUTCHAN: { width: "500px", height: "500px" },
    ACHIEVEMENTS: { width: "300px", height: "300px" },
    FRIENDSLIST: { width: "450px", height: "600px" },
    MODAL: { width: "390px", height: "200px" },
    MODALREQUESTED: { width: "390px", height: "250px" },
    PENDINGREQUESTS: { width: "300px", height: "300px" },
    BLOCKEDUSERS: { width: "300px", height: "400px" },
    TWOFAQRCODE: { width: "300px", height: "400px" },
    ADDFRIENDS: { width: "300px", height: "400px" },
    ADDMEMBERS: { width: "300px", height: "400px" },
    AVATARUPLOAD: { width: "300px", height: "250px" },
    MEMBERSETTINGS: { width: "430px", height: "330px" },
    CHANSETTINGS: { width: "500px", height: "350px" },
    BANLIST: { width: "300px", height: "400px" },
    CHATSESSION: { width: "350px", height: "500px" },   
    PLAY: { width: "420px", height: "340px" },
    PONG: { width: "815px", height: "550px" },
	PREVIEW: { width: "815px", height: "550px" },
	CREATECUSTOM: { width: "500px", height: "350px" },
	JOINCUSTOM: { width: "900px", height: "900px" },
  };

  const [currentTargetUserId, setCurrentTargetUserId] = useState(null);

  const [currentTargetChannelId, setCurrentTargetChannelId] = useState(null);

  const { data: commonChannels } = useQuery<{ id: number }[]>({
    queryKey: ["commonChannels", currentTargetUserId],
    queryFn: () => {
      return api
        .get("/channels/common/" + currentTargetUserId)
        .then((response) => response.data);
    },
    enabled: !!currentTargetUserId,
  });

  const { data: currUserOnlyChannels } = useQuery<{ id: number }[]>({
    queryKey: ["currUserOnlyChannels", currentTargetUserId],
    queryFn: () => {
      return api
        .get("/channels/excluded/" + currentTargetUserId)
        .then((response) => response.data);
    },
    enabled: !!currentTargetUserId,
  });

  const { data: targetUser } = useQuery<{ id: number; username: string }>({
    queryKey: ["username", currentTargetUserId],
    queryFn: () => {
      return api
        .get("/user/" + currentTargetUserId)
        .then((response) => response.data);
    },
    enabled: !!currentTargetUserId,
  });

  const { data: userChannelNames } = useQuery<ChatType[]>({
    queryKey: ["userChannelNames"],
    queryFn: async () => {
      return api.get("/chats").then((response) => response.data);
    },
  });

	const invalidateMessagesQueries = () => {
		commonChannels?.forEach((c) => {
			queryClient.invalidateQueries({
				queryKey: ["messages", c.id],
			});
		});
	};

	const invalidateAddChannelQueries = () => {
		currUserOnlyChannels?.forEach((c) => {
			queryClient.invalidateQueries({
				queryKey: ["addChannel", c.id],
			});
		});
	};

  const closeDMWindow = () => {
    let windows = store.getState().windows;
    windows = windows.filter(
      (window) =>
        window.WindowName === targetUser?.username &&
        window.content.type === "CHATSESSION"
    );
    windows.forEach((window) => store.dispatch(delWindow(window.id)));
  };

  useEffect(() => {
    let windows = store.getState().windows;
    windows = windows.filter(
      (window) =>
        (!userChannelNames?.some((el) => el.name === window.WindowName) &&
          window.content.type === "CHATSESSION") ||
        (!userChannelNames?.some(
          (el) => "About" + el.name === window.WindowName
        ) &&
          window.content.type === "ABOUTCHAN")
    );
    windows.forEach((window) => store.dispatch(delWindow(window.id)));
  }, [userChannelNames]);

  const [userEventType, setUserEventType] = useState({
    type: UserEventType.NOEVENT,
  });

  useEffect(() => {
    switch (userEventType.type) {
      case UserEventType.FRIENDREQUESTRECEIVED:
        queryClient.invalidateQueries({
          queryKey: ["addFriendsList"],
        });
        queryClient.invalidateQueries({
          queryKey: ["pendingRequests"],
        });
        queryClient.invalidateQueries({
          queryKey: ["friendsList"],
        });
        queryClient.invalidateQueries({
          queryKey: ["profile", currentTargetUserId],
        });
        queryClient.invalidateQueries({
          queryKey: ["user", currentTargetUserId],
        });
        queryClient.invalidateQueries({
          queryKey: ["friendship", currentTargetUserId],
        });
        queryClient.invalidateQueries({
          queryKey: ["pendingRequests", "Profile"],
        });
        break;
      case UserEventType.FRIENDSHIPREMOVED:
        queryClient.invalidateQueries({
          queryKey: ["addFriendsList"],
        });
        queryClient.invalidateQueries({
          queryKey: ["friendsList"],
        });
        queryClient.invalidateQueries({
          queryKey: ["profile", currentTargetUserId],
        });
        queryClient.invalidateQueries({
          queryKey: ["user", currentTargetUserId],
        });
        queryClient.invalidateQueries({
          queryKey: ["friendship", currentTargetUserId],
        });
        break;
      case UserEventType.FRIENDREQUESTREVOKED:
        queryClient.invalidateQueries({
          queryKey: ["pendingRequests"],
        });
        queryClient.invalidateQueries({
          queryKey: ["pendingRequests", "Profile"],
        });
        queryClient.invalidateQueries({
          queryKey: ["profile", currentTargetUserId],
        });
        queryClient.invalidateQueries({
          queryKey: ["addFriendsList"],
        });
        queryClient.invalidateQueries({
          queryKey: ["user", currentTargetUserId],
        });
        queryClient.invalidateQueries({
          queryKey: ["friendship", currentTargetUserId],
        });
        break;
      case UserEventType.FRIENDREQUESTACCEPTED:
        queryClient.invalidateQueries({
          queryKey: ["pendingRequests"],
        });
        queryClient.invalidateQueries({
          queryKey: ["pendingRequests", "Profile"],
        });
        queryClient.invalidateQueries({
          queryKey: ["profile", currentTargetUserId],
        });
        queryClient.invalidateQueries({
          queryKey: ["addFriendsList"],
        });
        queryClient.invalidateQueries({
          queryKey: ["friendsList"],
        });
        queryClient.invalidateQueries({
          queryKey: ["user", currentTargetUserId],
        });
        queryClient.invalidateQueries({
          queryKey: ["friendship", currentTargetUserId],
        });
        break;
      case UserEventType.USERUNBLOCKED:
        queryClient.invalidateQueries({
          queryKey: ["user", currentTargetUserId],
        });
        queryClient.invalidateQueries({
          queryKey: ["friendship", currentTargetUserId],
        });
        invalidateMessagesQueries();
        queryClient.invalidateQueries({
          queryKey: ["chats"],
        });
        queryClient.invalidateQueries({
          queryKey: ["user", currentTargetUserId],
        });
        queryClient.invalidateQueries({
          queryKey: ["friendship", currentTargetUserId],
        });
        queryClient.invalidateQueries({
          queryKey: ["addFriendsList"],
        });
        invalidateAddChannelQueries();
        queryClient.invalidateQueries({
          queryKey: ["profile", currentTargetUserId],
        });
        break;
      case UserEventType.USERBLOCKED:
        queryClient.invalidateQueries({
          queryKey: ["pendingRequests"],
        });
        queryClient.invalidateQueries({
          queryKey: ["pendingRequests", "Profile"],
        });
        queryClient.invalidateQueries({
          queryKey: ["addFriendsList"],
        });
        queryClient.invalidateQueries({
          queryKey: ["friendsList"],
        });
        invalidateAddChannelQueries();
        queryClient.invalidateQueries({
          queryKey: ["user", currentTargetUserId],
        });
        queryClient.invalidateQueries({
          queryKey: ["friendship", currentTargetUserId],
        });
        invalidateMessagesQueries();
        queryClient.invalidateQueries({
          queryKey: ["chats"],
        });
        queryClient.invalidateQueries({
          queryKey: ["profile", currentTargetUserId],
        });
        closeDMWindow();
        break;
      case UserEventType.ADDEDTOCHAN:
        queryClient.invalidateQueries({
          queryKey: ["chats"],
        });
        queryClient.invalidateQueries({
          queryKey: ["chanAbout", currentTargetChannelId],
        });
        queryClient.invalidateQueries({
          queryKey: ["userChannelNames"],
        });
        break;
      case UserEventType.KICKFROMCHAN:
        queryClient.invalidateQueries({
          queryKey: ["chats"],
        });
        queryClient.invalidateQueries({
          queryKey: ["chanAbout", currentTargetChannelId],
        });
        queryClient.invalidateQueries({
          queryKey: ["userChannelNames"],
        });
        break;
      case UserEventType.BANFROMCHAN:
        queryClient.invalidateQueries({
          queryKey: ["chats"],
        });
        queryClient.invalidateQueries({
          queryKey: ["chanAbout", currentTargetChannelId],
        });
        queryClient.invalidateQueries({
          queryKey: ["userChannelNames"],
        });
        queryClient.invalidateQueries({
          queryKey: ["banList", currentTargetChannelId],
        });
        queryClient.invalidateQueries({
          queryKey: ["channels"],
        });
        break;
      case UserEventType.UNBANFROMCHAN:
        queryClient.invalidateQueries({
          queryKey: ["channels"],
        });
        queryClient.invalidateQueries({
          queryKey: ["banList", currentTargetChannelId],
        });
        break;
      case UserEventType.MUTEINCHAN:
        queryClient.invalidateQueries({
          queryKey: ["userChannel", currentTargetChannelId],
        });
        break;
      case UserEventType.UNMUTEINCHAN:
        queryClient.invalidateQueries({
          queryKey: ["userChannel", currentTargetChannelId],
        });
        break;
      case UserEventType.DEPARTUREFROMCHAN:
        queryClient.invalidateQueries({
          queryKey: ["chanAbout", currentTargetChannelId],
        });
        invalidateMessagesQueries();
        break;
      case UserEventType.CHANDELETION:
        queryClient.invalidateQueries({
          queryKey: ["chats"],
        });
        queryClient.invalidateQueries({
          queryKey: ["userChannelNames"],
        });
        break;
      case UserEventType.USERDELETED:
        closeDMWindow();
        queryClient.invalidateQueries();
        break;
      case UserEventType.ADMINMADE:
        queryClient.invalidateQueries({
          queryKey: ["chanAbout", currentTargetChannelId],
        });
        queryClient.invalidateQueries({
          queryKey: ["self", currentTargetChannelId, currentTargetUserId],
        });
        queryClient.invalidateQueries({
          queryKey: ["self", currentTargetChannelId],
        });
        queryClient.invalidateQueries({
          queryKey: ["memberSettings", currentTargetUserId, currentTargetChannelId],
        });
        break;
      case UserEventType.DEMOTEADMIN:
        queryClient.invalidateQueries({
          queryKey: ["chanAbout", currentTargetChannelId],
        });
        queryClient.invalidateQueries({
          queryKey: ["self", currentTargetChannelId, currentTargetUserId],
        });
        queryClient.invalidateQueries({
          queryKey: ["self", currentTargetChannelId],
        });
        queryClient.invalidateQueries({
          queryKey: ["memberSettings", currentTargetUserId, currentTargetChannelId],
        });
        break;
      case UserEventType.OWNERMADE:
        queryClient.invalidateQueries({
          queryKey: ["chanAbout", currentTargetChannelId],
        });
        queryClient.invalidateQueries({
          queryKey: ["self", currentTargetChannelId, currentTargetUserId],
        });
        queryClient.invalidateQueries({
          queryKey: ["self", currentTargetChannelId],
        });
        queryClient.invalidateQueries({
          queryKey: ["memberSettings", currentTargetChannelId],
        });
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEventType]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      const eventSource = new EventSourcePolyfill(
        "api/user/stream/userevents",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      eventSource.onmessage = ({ data }) => {
        const parsedData = JSON.parse(data);
        const type = parsedData.type;
        const targetUserId = parsedData.userId;
        const targetChannelId = parsedData.channelId;
        setCurrentTargetUserId(targetUserId);
        setCurrentTargetChannelId(targetChannelId);
        setUserEventType({ type });
      };

			eventSource.onerror = (error) => {
				console.error("EventSource failed:", error);
			};

      return () => {
        eventSource.close();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, setCurrentTargetUserId, setCurrentTargetChannelId]);

	return (
		<div id="Background">
			{Array.isArray(memoizedWindows) &&
				memoizedWindows.map((window) => {
					const dimensions = windowDimensions[
						window.content.type
					] || {
						width: "500px",
						height: "600px",
					};
					const { width, height } = dimensions;
					return (
						<Window
							key={window.id}
							WindowName={window.WindowName}
							width={width}
							height={height}
							id={window.id}
							handleBarButton={window.handleBarButton}
							color={window.color}
							zindex={window.zindex || 0}
							isModal={window.content.type === "MODAL"}
						>
							{window.content.type === "LADDER" && (
								<Ladder winId={window.id} targetId={window.targetId} />
							)}
							{window.content.type === "CHAT" && <Chat winId={window.id} />}
							{window.content.type === "PROFILE" && (
								<Profile winId={window.id}
									targetId={window.content.id || undefined}
								/>
							)}
							{window.content.type === "FINDCHAN" && <FindChan winId={window.id} />}
							{window.content.type === "NEWCHAN" && (
								<NewChan winId={window.id} />
							)}
							{window.content.type === "ABOUTCHAN" && (
								<AboutChan winId={window.id}
									chanId={window.content.id || undefined}
								/>
							)}
							{window.content.type === "ACHIEVEMENTS" && (
								<Achievements winId={window.id} targetId={window.targetId} />
							)}
							{window.content.type === "FRIENDSLIST" && (
								<FriendsList winId={window.id} />
							)}
							{(window.content.type === "MODAL" ||
								window.content.type === "MODALREQUESTED") && (
								<Modal
									content={window.modal?.content}
									type={window.modal?.type}
									winId={window.id}
									action={window.modal?.action}
									targetId={window.modal?.targetId}
									channelId={window.modal?.channelId}
								/>
							)}
							{window.content.type === "PENDINGREQUESTS" && (
								<PendingRequests winId={window.id} />
							)}
							{window.content.type === "BLOCKEDUSERS" && (
								<BlockedUsers winId={window.id} />
							)}
							{window.content.type === "TWOFAQRCODE" && <TwoFA winId={window.id} />}
							{window.content.type === "ADDFRIENDS" && (
								<AddFriends winId={window.id} />
							)}
							{window.content.type === "AVATARUPLOAD" && (
								<AvatarUpload winId={window.id} />
							)}
							{window.content.type === "ADDMEMBERS" && (
								<AddMembers channelId={window.content.id} winId={window.id} />
							)}
							{window.content.type === "MEMBERSETTINGS" && (
								<MemberSettings
									targetId={
										window.targetId ? window.targetId : 0
									}
									channelId={
										window.channelId ? window.channelId : 0
									}
                  winId={window.id}
								/>
							)}
							{window.content.type === "CHANSETTINGS" && (
								<ChannelSettings
									channelId={window.content.id}
                  winId={window.id}
								/>
							)}
							{window.content.type === "BANLIST" && (
								<BanList
									channelId={
										window.channelId ? window.channelId : 0
									}
                  winId={window.id}
								/>
							)}
							{window.content.type === "CHATSESSION" && (
								<ChatSession channelId={window.content.id} winId={window.id} />
							)}
							{window.content.type === "PREVIEW" && <Preview />}
							{window.content.type === "PLAY" && (
								<MainGameMenu
									windowId={window.id}
									privateLobby={window.privateLobby}
								/>
							)}
						</Window>
					);
				})}
		</div>
	);
}
