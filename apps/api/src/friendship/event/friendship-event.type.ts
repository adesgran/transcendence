export enum FriendshipEventType {
  FRIENDREQUESTRECEIVED = 'FRIENDREQUESTRECEIVED',
  FRIENDSHIPREMOVED = 'FRIENDSHIPREMOVED',
  FRIENDREQUESTREVOKED = 'FRIENDREQUESTREVOKED',
  FRIENDREQUESTACCEPTED = 'FRIENDREQUESTACCEPTED',
  USERBLOCKED = 'USERBLOCKED',
  USERUNBLOCKED = 'USERUNBLOCKED',
}

export type FriendshipEvent = {
  type: FriendshipEventType;
  initiatorId: number;
  recipientId: number;
};