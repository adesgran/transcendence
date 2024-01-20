import { ChangeEvent, ReactNode, useState } from "react";
import "./Modal.css";
import { ModalType, addModal, iconsModal } from "../../utils/AddModal";
import { Button } from "../Button/Button";
import store from "../../../store";
import { addWindow, delWindow } from "../../../reducers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../axios";
import { router } from "../../../router";
import { WinColor } from "../../utils/WindowTypes";
import { Input } from "../Input/Input";

interface ModalProps {
  content?: ReactNode;
  type?: ModalType;
  winId: number;
  action?: ActionKey;
  targetId?: number;
  channelId?: number;
}

export type ActionKey =
  | "deleteFriendship"
  | "deleteBlockedFriendship"
  | "addBlockedFriendship"
  | "makeAdmin"
  | "demoteAdmin"
  | "makeOwner"
  | "deleteUser"
  | "enableTwoFA"
  | "disableTwoFA"
  | "kickUser"
  | "banUser"
  | "deleteChannel"
  | "logOut";

function Modal({
  content,
  type,
  winId,
  action,
  targetId,
  channelId,
}: ModalProps) {
  const queryClient = useQueryClient();

  const { data: commonChannels } = useQuery<{ id: number }[]>({
    queryKey: ["commonChannels"],
    queryFn: () => {
      return api
        .get("/channels/common/" + targetId)
        .then((response) => response.data);
    },
    enabled: !!targetId,
  });

  const { data: currUserOnlyChannels } = useQuery<{ id: number }[]>({
    queryKey: ["currUserOnlyChannels"],
    queryFn: () => {
      return api
        .get("/channels/excluded/" + targetId)
        .then((response) => response.data);
    },
    enabled: !!targetId,
  });

  const { data: user } = useQuery<{ id: number; username: string }>({
    queryKey: ["username", targetId],
    queryFn: () => {
      if (targetId)
        return api.get("/user/" + targetId).then((response) => response.data);
      else return api.get("/user").then((response) => response.data);
    },
  });

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
        queryKey: ["addFriendsList"],
      });
      queryClient.invalidateQueries({
        queryKey: ["user", targetId],
      });
      queryClient.invalidateQueries({
        queryKey: ["profile", targetId],
      });
      queryClient.invalidateQueries({
        queryKey: ["pendingRequests"],
      });
    },
  });

  const { mutateAsync: deleteBlockedFriendship } = useMutation({
    mutationFn: async () => {
      return await api.delete("/relationship/blocked/" + targetId);
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
        queryKey: ["chats"],
      });
      queryClient.invalidateQueries({
        queryKey: ["profile", targetId],
      });
      invalidateMessagesQueries();
      queryClient.invalidateQueries({
        queryKey: ["addFriendsList"],
      });
      invalidateAddChannelQueries();
      queryClient.invalidateQueries({
        queryKey: ["pendingRequests"],
      });
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
    const windows = store.getState().windows;
    windows
      .filter(
        (window) =>
          window.WindowName === user?.username &&
          window.content.type === "CHATSESSION"
      )
      .forEach((window) => store.dispatch(delWindow(window.id)));
  };

  const { mutateAsync: addBlockedFriendship } = useMutation({
    mutationFn: async () => {
      return await api.post("/block/" + targetId);
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
        queryKey: ["profile", targetId],
      });
      queryClient.invalidateQueries({
        queryKey: ["pendingRequests"],
      });
      queryClient.invalidateQueries({
        queryKey: ["chats"],
      });
      invalidateMessagesQueries();
      queryClient.invalidateQueries({
        queryKey: ["friendsList"],
      });
      queryClient.invalidateQueries({
        queryKey: ["addFriendsList"],
      });
      invalidateAddChannelQueries();
      closeDMWindow();
    },
  });

  const { mutateAsync: makeAdmin } = useMutation({
    mutationFn: async () => {
      return api.post("/user-channel/moderate/admin", {
        data: { targetId, channelId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["memberSettings", channelId, targetId],
      });
      queryClient.invalidateQueries({
        queryKey: ["chanAbout", channelId],
      });
      queryClient.invalidateQueries({
        queryKey: ["self", channelId],
      });
    },
  });

  const { mutateAsync: demoteAdmin } = useMutation({
    mutationFn: async () => {
      return api.patch("/user-channel/moderate/admin", {
        data: { targetId, channelId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["memberSettings", channelId, targetId],
      });
      queryClient.invalidateQueries({
        queryKey: ["chanAbout", channelId],
      });
      queryClient.invalidateQueries({
        queryKey: ["self", channelId],
      });
    },
  });

  const { mutateAsync: makeOwner } = useMutation({
    mutationFn: async () => {
      return api.post("/user-channel/moderate/owner", {
        data: { targetId, channelId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["memberSettings", channelId, targetId],
      });
      queryClient.invalidateQueries({
        queryKey: ["chanAbout", channelId],
      });
      queryClient.invalidateQueries({
        queryKey: ["self", channelId],
      });
    },
  });

  const { mutateAsync: deleteUser } = useMutation({
    mutationFn: async () => {
      return api.delete("/user");
    },
    onSuccess: () => {
      localStorage.removeItem("token");
      router.load();
    },
  });

  const { mutateAsync: enableTwoFA } = useMutation({
    mutationFn: async () => {
      return await api.post("/auth/2fa/enable");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile", targetId],
      });
      queryClient.invalidateQueries({ queryKey: ["user", targetId] });
      const newWindow = {
        WindowName: "Your 2FA QRCode",
        id: 0,
        content: { type: "TWOFAQRCODE" },
        toggle: false,
        handleBarButton: 4,
        color: WinColor.RED,
      };
      store.dispatch(addWindow(newWindow));
    },
  });

  const { mutateAsync: disableTwoFA } = useMutation({
    mutationFn: async () => {
      return await api.post("/auth/2fa/disable");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile", targetId],
      });
      queryClient.invalidateQueries({ queryKey: ["user", targetId] });
      const qrCodeWindow = store
        .getState()
        .windows.find((window) => window.content.type === "TWOFAQRCODE");
      if (qrCodeWindow) {
        store.dispatch(delWindow(qrCodeWindow.id));
      }
    },
  });

  const { mutateAsync: createUserChannel } = useMutation({
    mutationFn: async (param: { channelId: number }) => {
      return api.post("/user-channel", param);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  const { mutateAsync: checkPasswordChannel } = useMutation({
    mutationFn: async (param: { password: string }) => {
      return api
        .post("/channel/" + channelId + "/checkpwd", param)
        .then((response) => response.data);
    },
  });

  const [password, setPassword] = useState("");

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handlePasswordSubmit = async () => {
    const pwdCorrect = await checkPasswordChannel({ password });
    handleClose(winId);
    if (pwdCorrect) {
      await createUserChannel({ channelId: channelId || 0 });
      queryClient.invalidateQueries({
        queryKey: ["chanAbout", channelId],
      });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({
        queryKey: ["isMember", channelId],
      });
    } else {
      addModal(ModalType.ERROR, "Wrong password");
    }
  };

  const { mutateAsync: banUser } = useMutation({
    mutationFn: async () => {
      return api.post("/user-channel/moderate/ban", {
        data: { targetId: targetId, channelId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["memberSettings", channelId, targetId],
      });
      queryClient.invalidateQueries({
        queryKey: ["chanAbout", channelId],
      });
      queryClient.invalidateQueries({
        queryKey: ["banList", channelId],
      });
      queryClient.invalidateQueries({
        queryKey: ["self", channelId],
      });
      queryClient.invalidateQueries({
        queryKey: ["userChannelNames"],
      });
      const memberSettingsWindow = store
        .getState()
        .windows.find((window) => window.content.type === "MEMBERSETTINGS");
      if (memberSettingsWindow) {
        store.dispatch(delWindow(memberSettingsWindow.id));
      }
      store.dispatch(delWindow(winId));
    },
  });

  const { mutateAsync: kickUser } = useMutation({
    mutationFn: async () => {
      return api.post("/user-channel/moderate/kick", {
        data: { targetId: targetId, channelId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["memberSettings", channelId, targetId],
      });
      queryClient.invalidateQueries({
        queryKey: ["chanAbout", channelId],
      });
      queryClient.invalidateQueries({
        queryKey: ["self", channelId],
      });
      queryClient.invalidateQueries({
        queryKey: ["userChannelNames"],
      });
      const memberSettingsWindow = store
        .getState()
        .windows.find((window) => window.content.type === "MEMBERSETTINGS");
      if (memberSettingsWindow) {
        store.dispatch(delWindow(memberSettingsWindow.id));
      }
      store.dispatch(delWindow(winId));
    },
  });

  const { mutateAsync: deleteChannel } = useMutation({
    mutationFn: async () => {
      return api.delete(`/channel/${channelId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chats"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userChannelNames"],
      });
      const windows = store
        .getState()
        .windows.filter((window) => window.channelId === channelId);
      if (windows) {
        for (const window of windows) {
          store.dispatch(delWindow(window.id));
        }
      }
      store.dispatch(delWindow(winId));
    },
  });

  const logOut = () => {
    localStorage.removeItem("token");
    router.load();
  };

  const actions = {
    deleteFriendship,
    deleteBlockedFriendship,
    addBlockedFriendship,
    makeAdmin,
    demoteAdmin,
    makeOwner,
    deleteUser,
    enableTwoFA,
    disableTwoFA,
    kickUser,
    banUser,
    deleteChannel,
    logOut,
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
      {type !== ModalType.REQUESTED ? (
        <div className="bodyModal">
          {icon}
          <div className="textModal">
            <div className="heading-600">{type}</div>
            <div className="heading-500">{content}</div>
          </div>
        </div>
      ) : (
        <>
          <div className="bodyModal">
            {iconsModal["REQUESTED"]}
            <div className="textModal">
              <div className="heading-600">REQUESTED</div>
              <div className="heading-500">
                This channel is password-protected
              </div>
            </div>
          </div>
          <div className="middlePartModal">
            <div className="subTextModal">
              Please enter the password to gain access
            </div>
            <Input
              className="inputRequestedModal"
              placeholder="Type here..."
              value={password}
              onChange={handlePasswordChange}
              type="password"
            />
          </div>
        </>
      )}
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
          <Button
            color="red"
            content="ok"
            onClick={
              action ? () => handleAction(winId) : () => handleClose(winId)
            }
          />
        )}
        {type === ModalType.REQUESTED && (
          <>
            <Button
              color="purple"
              content="ok"
              onClick={handlePasswordSubmit}
            />
            <Button
              color="purple"
              content="quit"
              onClick={() => handleClose(winId)}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Modal;
