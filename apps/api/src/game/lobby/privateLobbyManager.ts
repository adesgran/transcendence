import { lobby } from './lobby';
import { clientInfo } from '../dto-interface/clientInfo.interface';
import { normalGameInfo } from '../dto-interface/shared/normalGameInfo';

export class privateLobbyManager {
  private privateLobbies: lobby[] = [];
  private privateQueue: clientInfo[] = [];

  public joinPrivate(client: clientInfo) {
      console.log('test 8');
    const index = this.privateLobbies.findIndex((value) => {
      return value.getMatchInfo().userId === client.user.id;
    });
    if (index !== -1) {
      console.log('test 9');
      client.mode = 'private';
      this.privateLobbies[index].getPlayer()[0].status = 'inGame';
      client.status = 'inGame';
      client.lobby = this.privateLobbies[index];
      this.privateLobbies[index].addClient(client);
      this.privateLobbies[index].start();
      this.privateLobbies.splice(index, 1);
      console.log('test 10');
    }
      console.log('test 11');
  }

  public createPrivate(client: clientInfo, id: number) {
      console.log('test 3');
    console.log('SIZE: ', this.privateLobbies.length);
    client.status = 'waiting join private';
    client.mode = 'private';
    const newLobby = new lobby('private', {...normalGameInfo, userId: id});
    client.lobby = newLobby;
    newLobby.addClient(client);
    this.privateLobbies.push(newLobby);
      console.log('test 4');
  }

  public removeToPrivateQueue(client: clientInfo, playerInvited: clientInfo | null) {
    client.status === 'connected';
    const index = this.privateQueue.findIndex((value) => {
      return value === client;
    });
    if (index !== -1) {
      if (client.status === 'waiting join private')
        this.privateQueue.splice(index, 1);
      if (playerInvited) {
        console.log('ffffffffffffffffffffffffff');
        playerInvited.socket.emit('server.cancelInvite');
      }
    }
  }

  public cancelPrivateInvitation(client: clientInfo, id: number) {
    const index = this.privateLobbies.findIndex((value) => {
      return value.getPlayer()[0].user.id === id;
    });

    if (index !== -1) {
      const otherPlayer: clientInfo = this.privateLobbies[index].getPlayer()[0];
      otherPlayer.status = 'connected';
      this.privateQueue.splice(index, 1);
      otherPlayer.socket.emit('server.cancelInvite');
    }
  }

  public cleanLobbies() {
    this.privateLobbies = this.privateLobbies.filter(
      (lobby) => lobby.isEmpty() === false,
    );
  }
}