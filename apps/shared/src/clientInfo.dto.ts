import { IsString } from 'class-validator';
import { Socket } from 'socket.io';
import { lobby } from '../lobby/lobby';
import { input } from './input.interface';
import { gameInfo } from './shared/gameInfo.interface';

export class clientInfoDto {
  socket?: Socket;
  lobby?: lobby | null;
  @IsString()
  user: string;
  @IsString()
  mode: 'normal' | 'custom';
  @IsString()
  status: 'connected' | 'waiting join normal' | 'waiting create custom' | 'inGame' | 'inJoinTab';
  input: input;
  matchInfo: gameInfo;
}
