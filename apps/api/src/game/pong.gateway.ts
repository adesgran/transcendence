import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { lobbyManager } from './lobby/lobbyManager';
import { normalLobbyManager } from './lobby/normalLobbyManager';
import { clientInfo } from './dto-interface/clientInfo.interface';
import { gameInfoDto } from './dto-interface/shared/gameInfo.dto';
import { normalGameInfo } from './dto-interface/shared/normalGameInfo';
import { input } from './dto-interface/input.interface';
import { baseClientInfo } from './dto-interface/baseClientInfo';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { privateLobbyManager } from './lobby/privateLobbyManager';

@WebSocketGateway({ cors: true })
export class PongGateway {
  private connectedClient: clientInfo[] = [];
  private readonly lobbyManager: lobbyManager = new lobbyManager();
  private readonly normalLobbyManager: normalLobbyManager =
    new normalLobbyManager();
  private readonly privateLobbyManager: privateLobbyManager =
    new privateLobbyManager();

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  afterInit() {}

  async handleConnection(client: any) {
    try {
      const payload = await this.authService.checkTokenValidity(
        client.handshake.auth.token,
        process.env.APP_SECRET,
      );
      const user = await this.userService.getUser(payload.id);
      const newClient: clientInfo = { ...baseClientInfo };
      newClient.socket = client;
      newClient.user = user;
      this.connectedClient.push(newClient);
    } catch (ex) {
      console.log('socket connection failed');
      client.emit('connect_failed');
    }
  }

  @SubscribeMessage('client.closeMainWindow')
  handleCloseMainWindow(client: Socket) {
    const index = this.connectedClient.findIndex((value) => {
      return value.socket === client;
    });
    if (index !== -1) {
      const polo = this.connectedClient[index];
      if (polo.status == 'inGame' && polo.lobby != null) {
        polo.lobby.onDisconnect(polo);
      }
      if (polo.status === 'waiting join normal')
        this.normalLobbyManager.removeToNormalQueue(polo);
      if (polo.status === 'waiting create custom')
        this.lobbyManager.removeToCustomQueue(polo);
      if (polo.status === 'inJoinTab') this.lobbyManager.removeInJoinTab(polo);
      this.connectedClient[index].status = 'connected';
    }
    this.lobbyManager.cleanLobbies();
  }

  handleDisconnect(client: Socket) {
    const index = this.connectedClient.findIndex((value) => {
      return value.socket === client;
    });
    if (index !== -1) {
      const polo = this.connectedClient[index];
      if (polo.status == 'inGame' && polo.lobby != null) {
        polo.lobby.onDisconnect(polo);
      }
      if (polo.status === 'waiting join normal')
        this.normalLobbyManager.removeToNormalQueue(polo);
      if (polo.status === 'inJoinTab') this.lobbyManager.removeInJoinTab(polo);
      if (polo.status === 'waiting create custom')
        this.lobbyManager.removeToCustomQueue(polo);
      if (polo.status === 'waiting join private')
        this.lobbyManager.removeToCustomQueue(polo);
      this.connectedClient.splice(index, 1);
    }
    this.lobbyManager.cleanLobbies();
  }

  @SubscribeMessage('client.normalMatchmaking')
  handleMatchmaking(client: Socket) {
    const index = this.connectedClient.findIndex((value) => {
      return value.socket === client;
    });
    if (index !== -1) {
      this.normalLobbyManager.addToNormalQueue(this.connectedClient[index]);
    }
  }

  @SubscribeMessage('client.joinNormalAbort')
  handleJoinNormalAbort(client: Socket) {
    const index = this.connectedClient.findIndex((value) => {
      return value.socket === client;
    });
    if (index !== -1) {
      this.normalLobbyManager.removeToNormalQueue(this.connectedClient[index]);
    }
  }

  @SubscribeMessage('client.createCustomAbort')
  handleCreateCustomAbort(client: Socket) {
    const index = this.connectedClient.findIndex((value) => {
      return value.socket === client;
    });
    if (index !== -1) {
      this.lobbyManager.removeToCustomQueue(this.connectedClient[index]);
    }
  }

  @SubscribeMessage('client.previewUpdate')
  handlePreview(client: Socket, data: gameInfoDto) {
    client.emit('server.previewUpdate', data);
  }

  @SubscribeMessage('client.createCustom')
  handleCreateCustom(client: Socket, gameData: gameInfoDto) {
    const index = this.connectedClient.findIndex((value) => {
      return value.socket === client;
    });
    if (index !== -1) {
      this.lobbyManager.createCustomLobby(this.connectedClient[index], {
        ...normalGameInfo,
        ...gameData,
      });
    }
  }

  @SubscribeMessage('client.joinMatch')
  handleJoinCustom(client: Socket, matchId: number) {
    const index = this.connectedClient.findIndex((value) => {
      return value.socket === client;
    });
    if (index !== -1) {
      this.lobbyManager.addPlayerToMatch(this.connectedClient[index], matchId);
    }
  }
  @SubscribeMessage('client.inJoinTab')
  handleJoin(client: Socket) {
    this.lobbyManager.cleanLobbies();
    const index = this.connectedClient.findIndex((value) => {
      return value.socket === client;
    });
    if (index !== -1) {
      this.lobbyManager.addInJoinTab(this.connectedClient[index]);
    }
  }

  @SubscribeMessage('client.createPrivate')
  handlePrivateMatchmaking(client: Socket, id: number) {
    const index = this.connectedClient.findIndex((value) => {
      return value.socket === client;
    });
    if (index !== -1) {
      this.privateLobbyManager.createPrivate( this.connectedClient[index], id);
    }
  }

  @SubscribeMessage('client.joinPrivate')
  handleJoinMatchmaking(client: Socket, id: number) {
    const index = this.connectedClient.findIndex((value) => {
      return value.socket === client;
    });
    if (index !== -1) {
      this.privateLobbyManager.joinPrivate(this.connectedClient[index]);
    }
  }

  @SubscribeMessage('client.invitationDecline')
  async handleInvitationDecline(client: Socket, id: number) {
    const index = this.connectedClient.findIndex((value) => {
      return value.socket === client;
    });
    if (index !== -1) {
      try {
        this.privateLobbyManager.cancelPrivateInvitation(
          this.connectedClient[index],
          id,
        );
      } catch (error) {
        console.error(error);
      }
    }
  }

  @SubscribeMessage('client.privateAbort')
  handlePrivateMatchmakingAbort(client: Socket) {
    const index = this.connectedClient.findIndex((value) => {
      return value.socket === client;
    });
    if (index !== -1) {
        this.privateLobbyManager.privateAbort(this.connectedClient[index], null);
      const index2 = this.connectedClient.findIndex((value) => {
        return (
          value.user.id ===
          this.connectedClient[index].lobby.getMatchInfo().userId
        );
      });
      if (index2 !== -1) {
        this.privateLobbyManager.privateAbort(this.connectedClient[index], this.connectedClient[index2]);
      }
    }
  }

  @SubscribeMessage('client.input')
  handleInput(client: Socket, inputData: input) {
    const index = this.connectedClient.findIndex((value) => {
      return value.socket === client;
    });
    if (index !== -1) {
      this.connectedClient[index].input = inputData;
    }
  }

  @SubscribeMessage('client.getStatusUser')
  handleGetStatusUser(client: Socket, data: { user: string }) {
    const index = this.connectedClient.findIndex((value) => {
      return value.user.username === data.user;
    });
    if (index !== -1) {
      client.emit('server.getStatusUser', {
        data: {
          username: data.user,
          status:
            this.connectedClient[index].status == 'connected'
              ? 'ONLINE'
              : 'INGAME',
        },
      });
    } else
      client.emit('server.getStatusUser', {
        data: { username: data.user, status: 'OFFLINE' },
      });
  }
}
