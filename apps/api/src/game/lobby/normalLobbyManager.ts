import { lobby } from './lobby';
import { clientInfo } from '../dto-interface/clientInfo.interface';

export class normalLobbyManager {
  private normalLobbies: lobby[] = [];
  private normalQueue: clientInfo[] = [];

  public addToNormalQueue(client: clientInfo) {
    client.status = 'waiting join normal';
    client.mode = 'normal';
    this.normalQueue.push(client);
    this.MATCH();
  }

  public removeToNormalQueue(client: clientInfo) {
    client.status === 'connected';
    const index = this.normalQueue.findIndex((value) => {
      return value === client;
    });
    if (index !== -1) {
      if (client.status === 'waiting join normal')
        this.normalQueue.splice(index, 1);
    }
  }

  public cleanLobbies() {
    this.normalLobbies.filter((lobby) => lobby.isEmpty() === true);
  }

  private MATCH() {
    if (this.normalQueue.length >= 2) {
      const playerOne = this.normalQueue.shift();
      const playerTwo = this.normalQueue.shift();
      const newLobby = new lobby('normal', null);
      playerOne.lobby = newLobby;
      playerTwo.lobby = newLobby;
      playerOne.status = 'inGame';
      playerTwo.status = 'inGame';
      newLobby.addClient(playerOne);
      newLobby.addClient(playerTwo);
      this.normalLobbies.push(newLobby);
      newLobby.start();
    }
  }
}
