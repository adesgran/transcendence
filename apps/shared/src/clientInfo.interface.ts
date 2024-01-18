import { Socket } from 'socket.io';
import { lobby } from './lobby';
import { input } from './input.interface';
import { gameInfo } from './gameInfo.interface';

export interface clientInfo {
  socket?: Socket | null;
  lobby?: lobby | null;
  user?: {id: number, username: string, avatar_url: string} | null;
  mode: 'normal' | 'custom' | 'private' | null;
  status: 'connected' | 'waiting join normal' | 'waiting create custom' | 'waiting join private' | 'inGame' | 'inJoinTab';
  input: input;
  matchInfo: gameInfo;
}
