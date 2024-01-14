import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import List from "../../../shared/ui-components/List/List";
import "./ChatSession.css";
import api from "../../../axios";
import { Button } from "../../../shared/ui-components/Button/Button";
import { HBButton, WinColor } from "../../../shared/utils/WindowTypes";
import store from "../../../store";
import { addWindow } from "../../../reducers";
import { ChatType } from "../Chat";
import Message from "../../../shared/ui-components/Message/Message";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { formatTime, formatDate } from "../../../shared/utils/DateUtils";

interface ChatSessionProps {
  channelId?: number;
}

export type MessageData = {
  id: number;
  content: string;
  created_at: Date;
  user: {
    id: number;
    username: string;
    avatar_url: string;
    friendships: {
      id: number;
      user1_id: number;
      user2_id: number;
      status: "FRIENDS" | "PENDING" | "BLOCKED";
    }[];
  };
};

type MutedData = {
  id: number;
  isMuted: boolean;
  mutedUntil: Date;
};

function ChatSession({ channelId }: ChatSessionProps) {
  const queryClient = useQueryClient();

  const [receivedInvitation, setReceivedInvitation] = useState<{
    username: string;
    id: number;
  } | null>(null);

  const { data: selfId } = useQuery<number>({
    queryKey: ["selfId"],
    queryFn: async () => {
      try {
        const response = await api.get("/id");
        return response.data;
      } catch (error) {
        console.error("Error fetching selfId:", error);
        throw error;
      }
    },
  });

  const { data: userChannel } = useQuery<MutedData>({
    queryKey: ["userChannel", channelId],
    queryFn: async () => {
      try {
        const response = await api.get(
          "/user-channel/" + channelId + "/current-user"
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching userChannel:", error);
        throw error;
      }
    },
  });

  const { data: chat } = useQuery<ChatType>({
    queryKey: ["chat", channelId],
    queryFn: async () => {
      return api.get("/chat/" + channelId).then((response) => response.data);
    },
  });

  const { data: messages } = useQuery<MessageData[]>({
    queryKey: ["messages", channelId],
    queryFn: async () => {
      return api
        .get("/messages/" + channelId)
        .then((response) => response.data);
    },
  });

  const [valueMessage, setValueMessage] = useState("");

  const { mutateAsync: sendMessage } = useMutation({
    mutationFn: async (param: {
      message: string;
      channel_id: number | undefined;
    }) => {
      return api.post("/message", param);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", channelId],
      });
      setValueMessage("");
    },
  });

  const { mutateAsync: deleteGameInvitation } = useMutation({
    mutationFn: async () => {
      return api.delete(`/message/invitation`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", channelId],
      });
    },
    onError: (error) => {
      console.error(error.message);
    },
  });

  const { mutateAsync: updateReadUntil } = useMutation({
    mutationFn: async () => {
      return api.patch("/user-channel/" + channelId + "/readuntil");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chats"],
      });
    },
  });

  useEffect(() => {
    if (localStorage.getItem("token")) {
      const eventSource = new EventSourcePolyfill("api/stream/messages", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      eventSource.onmessage = ({ data }) => {
        if (data.user_id !== selfId)
          updateReadUntil().then(() => {
            queryClient.invalidateQueries({
              queryKey: ["messages", channelId],
            });
          });
      };

      eventSource.onerror = (error) => {
        console.error("EventSource failed:", error);
      };

      return () => {
        eventSource.close();
      };
    }
  }, [channelId, queryClient, selfId, updateReadUntil]);

  const detailsWindow = (isDm: boolean, id: number, name: string) => {
    let newWindow;
    if (!isDm) {
      newWindow = {
        WindowName: "About " + name,
        id: 0,
        content: { type: "ABOUTCHAN", id: id },
        toggle: false,
        handleBarButton: HBButton.Close + HBButton.Enlarge + HBButton.Reduce,
        color: WinColor.PURPLE,
      };
    } else {
      newWindow = {
        WindowName: name,
        id: 0,
        content: { type: "PROFILE", id: id },
        toggle: false,
        handleBarButton: HBButton.Close + HBButton.Enlarge + HBButton.Reduce,
        color: WinColor.PURPLE,
      };
    }
    store.dispatch(addWindow(newWindow));
  };

  const handleDetails = () => {
    if (chat?.type === "DM") {
      detailsWindow(true, chat?.interlocutor.id, chat.interlocutor.username);
    } else {
      detailsWindow(false, chat?.id || -1, chat?.name || "");
    }
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.target;
    setValueMessage(textarea.value);
    const minHeight = 30;
    textarea.style.height = `${minHeight}px`;
    if (textarea.scrollHeight > textarea.clientHeight) {
      const maxHeight = 100;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  };

  const handleSend = () => {
    sendMessage({ message: valueMessage, channel_id: channelId });
  };

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
    return () => {
      if (receivedInvitation) setReceivedInvitation(null);
    };
  }, [messages, receivedInvitation]);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const isBlocked = (message: MessageData) => {
    if (message.user.id !== selfId) {
      return message.user.friendships.some((f) => {
        return (
          (f.user1_id === selfId || f.user2_id === selfId) &&
          f.status === "BLOCKED"
        );
      });
    }
    return false;
  };

  const handleAcceptGameRequest = async () => {
    const newWindow = {
      WindowName: "Play",
      id: 0,
      toggle: false,
      content: { type: "PLAY" },
      handleBarButton: HBButton.Close + HBButton.Enlarge + HBButton.Reduce,
      targetId: receivedInvitation?.id,
      color: WinColor.PURPLE,
    };
    store.dispatch(addWindow(newWindow));
    deleteGameInvitation();
  };

  const handleRejectGameRequest = async () => {
    //send socket to cancel game
    deleteGameInvitation();
  };

  const handleMatchButton = async () => {
    sendMessage({ message: "/PongInvitation", channel_id: channelId });
    const newWindow = {
      WindowName: "Play",
      id: 0,
      toggle: false,
      content: { type: "PLAY" },
      handleBarButton: HBButton.Close + HBButton.Enlarge + HBButton.Reduce,
      targetId: chat?.interlocutor.id,
      color: WinColor.PURPLE,
    };
    store.dispatch(addWindow(newWindow));
  };

  const pendingGameRequest = () => {
    if (receivedInvitation)
      return (
        <div className="PendingGameRequest">
          <div className="Text">
            {receivedInvitation.username} send you a game request
          </div>
          <Button color="pink" icon="Check" onClick={handleAcceptGameRequest} />
          <Button
            color="red"
            icon="WhiteClose"
            onClick={handleRejectGameRequest}
          />
        </div>
      );
    else return null;
  };

  return (
    <div className="ChatSession">
      <div className="headerChatSession">
        <Button
          icon="TripleDot"
          color="pink"
          title="About"
          onClick={handleDetails}
        />
        {chat?.type === "DM" && !receivedInvitation ? (
          <Button content="Match" color="blue" onClick={handleMatchButton} />
        ) : (
          ""
        )}
      </div>
      {receivedInvitation ? pendingGameRequest() : ""}
      <List ref={listRef}>
        {messages?.map((message) => {
          if (message.content === "/PongInvitation" && chat?.type === "DM") {
            if (message.user.id !== selfId && !receivedInvitation)
              setReceivedInvitation({
                username: message.user.username,
                id: message.user.id,
              });

            return "";
          }
          return !isBlocked(message) ? (
            <Message message={message} key={message.id} />
          ) : (
            ""
          );
        })}
      </List>
      <div className="footerChatSession">
        {userChannel?.isMuted ? (
          <>
            <textarea
              className="typeBarChatSession custom-scrollbar white-list"
              placeholder={`You are muted until ${formatDate(
                new Date(userChannel?.mutedUntil)
              )} ${formatTime(new Date(userChannel?.mutedUntil))}`}
              disabled
            ></textarea>
            <Button className="btn-disabled" color="purple" content="send" />
          </>
        ) : (
          <>
            <textarea
              className="typeBarChatSession custom-scrollbar white-list"
              value={valueMessage}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
            ></textarea>
            <Button color="purple" content="send" onClick={handleSend} />
          </>
        )}
      </div>
    </div>
  );
}

export default ChatSession;
