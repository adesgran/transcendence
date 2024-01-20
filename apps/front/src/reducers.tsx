import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WinColor } from "./shared/utils/WindowTypes";
import { ReactNode } from "react";
import { ModalType } from "./shared/utils/AddModal";
import { ActionKey } from "./shared/ui-components/Modal/Modal";
import { gameInfo } from "shared/src/gameInfo.interface";

export interface WindowData {
  WindowName: string;
  position?: {
    x: string;
    y: string;
  };
  id: number;
  content: { type: string; id?: number };
  toggle: boolean;
  modal?: {
    type: ModalType;
    content: ReactNode;
    action?: ActionKey;
    targetId?: number;
    channelId?: number;
  };
  handleBarButton: number;
  color: WinColor;
  targetId?: number;
  channelId?: number;
  zindex?: number;
  gameInfo?: gameInfo;
  privateLobby?: {
    targetId: number;
    isFirstPlayer: boolean;
  };
}

export interface AppState {
  windows: WindowData[];
  id: number;
}

export const ADD_WINDOW = "ADD_WINDOW";

const initialState: AppState = {
  windows: [],
  id: 10,
};

function windowExists(windows: WindowData[], type: string, name: string) {
  return (
    windows.some((window) => window.content.type === type) &&
    windows.some((window) => window.WindowName === name)
  );
}

const windowsSlice = createSlice({
  name: "windows",
  initialState,
  reducers: {
    addWindow: (state, action: PayloadAction<WindowData>) => {
      const restrictedTypes = [
        "CHAT",
        "FINDCHAN",
        "LADDER",
        "NEWCHAN",
        "PROFILE",
        "ABOUTCHAN",
        "ACHIEVEMENTS",
        "ABOUTCHAN",
        "PENDINGREQUESTS",
        "BLOCKEDUSERS",
        "ADDFRIENDS",
        "AVATARUPLOAD",
        "MEMBERSETTINGS",
        "BANLIST",
        "TWOFAQRCODE",
        "FRIENDSLIST",
        "PLAY",
        "CHATSESSION",
        "MODAL",
      ];

      if (
        restrictedTypes.includes(action.payload.content.type) &&
        windowExists(
          state.windows,
          action.payload.content.type,
          action.payload.WindowName
        )
      ) {
        const windowIndex = state.windows.findIndex(
          (window) =>
            window.content.type === action.payload.content.type &&
            window.WindowName === action.payload.WindowName
        );

        if (windowIndex === -1) return;

        if (state.windows[windowIndex].toggle) {
          state.windows.forEach((window) => {
            if (
              window.zindex &&
              window.zindex > state.windows[windowIndex].zindex
            ) {
              window.zindex -= 1;
            }
          });

          state.windows[windowIndex].zindex = state.windows.length - 1;
        }
        return;
      }

      const res = action.payload;
      res.zindex = state.windows.length;
      if (!res.position) res.position = { x: "0px", y: "0px" };
      res.id = state.id;
      state.windows.push(res);
      state.id++;
    },
    delWindow: (state, action: PayloadAction<number>) => {
      const deleteWindow = (toDel: number) => {
        if (toDel !== -1) {
          const toDelZindex = state.windows[toDel].zindex || 1000;

          state.windows.splice(toDel, 1);

          state.windows.forEach((window) => {
            if (window.zindex && window.zindex > toDelZindex) {
              window.zindex -= 1;
            }
          });
        }
      };

      const win = state.windows.find((w) => w.id === action.payload);
      if (win?.content.type === "PLAY") {
        const createCustomIndex = state.windows.findIndex(
          (window) => window.content.type === "CREATECUSTOM"
        );
        if (createCustomIndex != -1) deleteWindow(createCustomIndex);
      } else if (win?.content.type === "ABOUTCHAN") {
        {
          const index = state.windows.findIndex(
            (window) =>
              window.content.type === "MEMBERSETTINGS" &&
              window.channelId === win.content.id
          );
          if (index != -1) deleteWindow(index);
        }
        {
          const index = state.windows.findIndex(
            (window) =>
              window.content.type === "CHANSETTINGS" &&
              window.content.id === win.content.id
          );
          if (index != -1) deleteWindow(index);
        }
      }

      const deletedWindowIndex = state.windows.findIndex(
        (window) => window.id === action.payload
      );
      deleteWindow(deletedWindowIndex);
    },
    bringToFront: (state, action: PayloadAction<number>) => {
      const windowToBringToFrontIndex = state.windows.findIndex(
        (window) => window.id === action.payload
      );

      if (windowToBringToFrontIndex >= 0) {
        const windowToBringToFrontZindex =
          state.windows[windowToBringToFrontIndex].zindex;

        if (typeof windowToBringToFrontZindex !== "undefined") {
          state.windows.forEach((window) => {
            if (window.zindex && window.zindex > windowToBringToFrontZindex) {
              window.zindex -= 1;
            }
          });

          state.windows[windowToBringToFrontIndex].zindex =
            state.windows.length - 1;
        }
      }
    },
    renameWindow: (
      state,
      action: PayloadAction<{ id: number; newName: string }>
    ) => {
      const windowIndex = state.windows.findIndex(
        (f) => f.id === action.payload.id
      );

      if (windowIndex !== -1) {
        state.windows[windowIndex].WindowName =
          `About ${action.payload.newName}`;
      }
    },
  },
});

export const { addWindow, delWindow, bringToFront, renameWindow } =
  windowsSlice.actions;

export default windowsSlice.reducer;
