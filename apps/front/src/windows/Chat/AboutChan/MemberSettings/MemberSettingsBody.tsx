import api from "../../../../axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ModalType, addModal } from "../../../../shared/utils/AddModal";
import Countdown from "react-countdown";

interface MemberSettingsBodyProps {
  user: {
    id: number;
    username: string;
    isMuted: boolean;
    mutedUntil: Date;
  };
  channelId: number;
}

export function MemberSettingsBody({
  user,
  channelId,
}: MemberSettingsBodyProps) {
  const queryClient = useQueryClient();

  const [muteTime, setMuteTime] = useState("");
  const [muteTimeUnit, setMuteTimeUnit] = useState("sec");

  const { mutateAsync: muteUser } = useMutation({
    mutationFn: async (endDate: Date) => {
      return api.post("/user-channel/moderate/mute", {
        data: { targetId: user.id, channelId, endDate },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["memberSettings", user.id, channelId],
      });
      queryClient.invalidateQueries({
        queryKey: ["chanAbout", channelId],
      });
    },
  });

  const { mutateAsync: unmuteUser } = useMutation({
    mutationFn: async () => {
      return api.patch("/user-channel/moderate/unmute", {
        data: { targetId: user.id, channelId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["memberSettings", user.id, channelId],
      });
      queryClient.invalidateQueries({
        queryKey: ["chanAbout", channelId],
      });
    },
  });

  const handleMute = async () => {
    let muteTimeInSeconds;
    if (!muteTime || parseInt(muteTime, 10) === 0) {
      muteTimeInSeconds = 42 * 365 * 24 * 60 * 60;
    } else {
      switch (muteTimeUnit) {
        case "min":
          muteTimeInSeconds = parseInt(muteTime, 10) * 60;
          break;
        case "hour":
          muteTimeInSeconds = parseInt(muteTime, 10) * 60 * 60;
          break;
        case "day":
          muteTimeInSeconds = parseInt(muteTime, 10) * 60 * 60 * 24;
          break;
        default:
          muteTimeInSeconds = parseInt(muteTime, 10);
      }
    }

    const currentDate = new Date();
    const endDate = new Date(currentDate.getTime() + muteTimeInSeconds * 1000);
    await muteUser(endDate);
    queryClient.invalidateQueries({
      queryKey: ["memberSettings", channelId, user.id],
    });
  };

  const handleUnmute = () => {
    unmuteUser();
  };

  const handleBan = () => {
    addModal(
      ModalType.WARNING,
      `Are you sure you want to ban ${user.username} from channel?`,
      "banUser",
      user.id,
      channelId
    );
  };

  const handleKick = () => {
    addModal(
      ModalType.WARNING,
      `Are you sure you want to kick ${user.username} from channel?`,
      "kickUser",
      user.id,
      channelId
    );
  };

  const muteDiv = (
    <div className="Mute">
      {user.isMuted ? (
        <div className="Button" onClick={handleUnmute}>
          <div className="Frame">
            <div className="Label">Unmute</div>
          </div>
        </div>
      ) : (
        <div className="Button" onClick={handleMute}>
          <div className="Frame">
            <div className="Label">Mute</div>
          </div>
        </div>
      )}
      {user.isMuted ? (
        <div className="Date">
          Mute expires in:&nbsp;
          <Countdown
            date={user.mutedUntil}
            onComplete={() =>
              queryClient.invalidateQueries({
                queryKey: ["memberSettings", channelId, user.id],
              })
            }
          />
        </div>
      ) : (
        <div className="Typebar">
          <input
            className="Placeholder"
            onChange={(e) => setMuteTime(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                handleMute;
              }
            }}
          />
          <select
            className="Timeunit"
            name="muteTimeUnit"
            value={muteTimeUnit}
            onChange={(e) => setMuteTimeUnit(e.target.value)}
          >
            <option value="sec">sec</option>
            <option value="min">min</option>
            <option value="hour">hour</option>
            <option value="day">day</option>
          </select>
        </div>
      )}
    </div>
  );

  const banDiv = (
    <div className="Ban">
      <div className="Button" onClick={handleBan}>
        <div className="Frame">
          <div className="Label">Ban</div>
        </div>
      </div>
    </div>
  );

  const kickDiv = (
    <div className="Kick">
      <div className="Button" onClick={handleKick}>
        <div className="Frame">
          <div className="Label">Kick</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="MemberSettingsBody">
      <div className="Frame">
        {muteDiv}
        {banDiv}
        {kickDiv}
      </div>
      <div className="Srollbar">
        <div className="Background">
          <div className="Cursor"></div>
        </div>
      </div>
    </div>
  );
}
