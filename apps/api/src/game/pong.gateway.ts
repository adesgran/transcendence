import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { lobbyManager } from './lobby/lobbyManager';
import { clientInfoDto } from './dto-interface/clientInfo.dto';
import { input } from './dto-interface/input.interface';
import { da } from '@faker-js/faker';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { CurrentUser } from 'src/decorators/user.decorator';

@WebSocketGateway({ cors: true })
export class PongGateway {
  private connectedClient: clientInfoDto[] = [];
  private readonly lobbyManager: lobbyManager = new lobbyManager(
    this.connectedClient,
  );
  constructor(private jwt: JwtService) {}
  afterInit() {
    console.log('gateway initialised');
  }

  handleConnection(client: any, ...args: any[]) {
    console.error(`Client : ${client.id} ${args}connected`);
    const newClient: clientInfoDto = new clientInfoDto();
    newClient.status = 'connected';
    newClient.socket = client;
    newClient.input = { direction: null, isPressed: false };
    this.connectedClient.push(newClient);
    this.connectedClient.forEach((element) => {
      console.log('lol', element.socket.id);
    });
  }

  @SubscribeMessage('client.openGame')
  handleOpenGame(client: Socket, data: clientInfoDto) {
    console.log(client.id, 'OpenGame');
  }

  @SubscribeMessage('client.authentification')
  async handleAuthentification(
    client: Socket,
    data: { user: string; token: string },
  ) {
    if (!data.token) {
      client.emit('401');
      client.disconnect(); //mathilde todo
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwt.verifyAsync(data.token, {
        secret: process.env.APP_SECRET,
      });
    } catch {
      client.disconnect();
      throw new UnauthorizedException();
    }
    const index = this.connectedClient.findIndex((value) => {
      return value.socket === client;
    });
    if (index !== -1) {
      this.connectedClient[index].user = data.user;
    }
  }

  @SubscribeMessage('client.normalMatchmaking')
  handleMatchmaking(client: Socket) {
    const index = this.connectedClient.findIndex((value) => {
      return value.socket === client;
    });
    if (index !== -1) {
      client.emit('server.matchLoading');
      this.connectedClient[index].mode = 'normal';
      this.lobbyManager.addToNormalQueue(this.connectedClient[index]);
    }
  }
  @SubscribeMessage('client.input')
  handleInput(client: Socket, input: input) {
    const index = this.connectedClient.findIndex((value) => {
      return value.socket === client;
    });
    if (index !== -1) {
      this.connectedClient[index].input = input;
    }
    console.log(input.direction, input.isPressed);
  }

  @SubscribeMessage('client.getStatusUser')
  handleGetStatusUser(client: Socket, data: { user: string }) {
    const index = this.connectedClient.findIndex((value) => {
      console.log({ value }, { data });
      return value.user === data.user;
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

  handleDisconnect(client: Socket) {
    console.log(`Cliend ${client.id} disconnected`);
    const index = this.connectedClient.findIndex((value) => {
      return value.socket === client;
    });
    if (index !== -1) {
      if (this.connectedClient[index].lobby != null) {
        this.connectedClient[index].lobby.onDisconnect(
          this.connectedClient[index],
        );
      }
      this.connectedClient.splice(index, 1);
    }
    this.lobbyManager.cleanLobbies();
  }
}
