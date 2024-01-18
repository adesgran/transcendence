import { clientInfo } from './clientInfo.interface';
import { normalGameInfo } from './normalGameInfo';
import { baseInput } from './baseInput';

export const baseClientInfo: clientInfo = {
  socket: null,
  lobby: null,
  user: null,
  mode: null,
  status: 'connected',
  input: { ...baseInput },
  matchInfo: { ...normalGameInfo },
};
