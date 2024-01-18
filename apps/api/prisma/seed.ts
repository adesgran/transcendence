import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function createUsers() {
  const amountOfUsers = 50;

  const users = [];

  for (let i = 0; i < amountOfUsers; i++) {
    const user = {
      username: faker.internet.userName(),
      avatar_url: faker.image.avatar(),
      id_42: faker.number.int({ min: 0, max: 1000000 }),
      token_42: faker.string.alphanumeric(20),
      secret_2fa: faker.string.alphanumeric(20),
      is_enable_2fa: false,
      created_at: faker.date.past(),
      updated_at: faker.date.recent(),
      socked_id: faker.string.alphanumeric(20),
    };

    users.push(user);
  }

  const addUsers = async () => await prisma.user.createMany({ data: users });

  await addUsers();
}

async function createChannels() {
  const amountOfChannels = 15;

  const channels = [];

  const chanType = ['PUBLIC', 'PROTECTED', 'PRIVATE'];

  for (let i = 0; i < amountOfChannels; i++) {
    const type = chanType[faker.number.int({ min: 0, max: 2 })];
    const channel = {
      name: faker.word.words({ count: { min: 1, max: 3 } }),
      topic: faker.lorem.lines({ min: 1, max: 4 }),
      type: type,
      password: type === 'PROTECTED' ? faker.word.words() : undefined,
      created_at: faker.date.past(),
      updated_at: faker.date.recent(),
    };

    channels.push(channel);
  }

  const addChannels = async () =>
    await prisma.channel.createMany({ data: channels });

  addChannels();
}

async function createDMs() {
  const userPool = await prisma.user.findMany();
  const amountOfChannels = 15;
  const idPairs: Set<string> = new Set();

  for (let i = 0; i < amountOfChannels; i++) {
    let a = 0;
    let b = 0;
    do {
      a = faker.number.int({ min: 0, max: userPool.length - 1 });
      b = faker.number.int({ min: 0, max: userPool.length - 1 });
    } while (a === b || idPairs.has(`${a},${b}`) || idPairs.has(`${b},${a}`));

    idPairs.add(`${a},${b}`);

    const userA = userPool[a];
    const userB = userPool[b];

    await prisma.channel.create({
      data: {
        name: faker.word.words({ count: { min: 1, max: 3 } }),
        topic: faker.lorem.lines({ min: 1, max: 4 }),
        type: 'DM',
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
        userChannels: {
          createMany: {
            data: [
              {
                user_id: userA.id,
                role: 'MEMBER',
              },
              {
                user_id: userB.id,
                role: 'MEMBER',
              },
            ],
          },
        },
      },
    });
  }
}

async function createUserAchievements() {
  const userPool = await prisma.user.findMany();

  const amountOfUserAchievements = 50;

  const userAchievements = [];

  const achievements = [
    'WELCOME',
    'TASTEOFV',
    'WINS10PLUS',
    'WIN10RAW',
    'NEMESIS',
    'FIRST',
    'POINTS100PLUS',
    'WINSINLESSTHAN1M',
    'ENDLESSSTAMINA',
  ];

  const addedAchievements = new Set();

  for (let i = 0; i < amountOfUserAchievements; i++) {
    let user = userPool[faker.number.int({ min: 0, max: userPool.length - 1 })];
    let achievement;

    while (!achievement || addedAchievements.has(`${user.id}_${achievement}`)) {
      achievement = achievements[faker.number.int({ min: 0, max: 8 })];
      user = userPool[faker.number.int({ min: 0, max: userPool.length - 1 })];
    }

    const userAchievement = {
      user_id: user.id,
      achievement: achievement,
      created_at: faker.date.past(),
      updated_at: faker.date.recent(),
    };

    userAchievements.push(userAchievement);

    addedAchievements.add(`${user.id}_${achievement}`);
  }

  const addUserAchievements = async () =>
    await prisma.userAchievement.createMany({ data: userAchievements });

  addUserAchievements();
}

async function createMatches() {
  const userPool = await prisma.user.findMany();
  const amountOfChannels = 500;
  const idPairs: Set<string> = new Set();

  for (let i = 0; i < amountOfChannels; i++) {
    let a = 0;
    let b = 0;
    do {
      a = faker.number.int({ min: 0, max: userPool.length - 1 });
      b = faker.number.int({ min: 0, max: userPool.length - 1 });
    } while (a === b || idPairs.has(`${a},${b}`) || idPairs.has(`${b},${a}`));

    idPairs.add(`${a},${b}`);

    const userA = userPool[a];
    const userB = userPool[b];

    await prisma.match.create({
      data: {
        on_going: true,
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
        players: {
          createMany: {
            data: [
              {
                user_id: userA.id,
                score: faker.number.int({ min: 0, max: 9 }),
                winner: faker.datatype.boolean(),
              },
              {
                user_id: userB.id,
                score: faker.number.int({ min: 0, max: 9 }),
                winner: faker.datatype.boolean(),
              },
            ],
          },
        },
      },
    });
  }
}

async function createFriendships() {
  const amountOfFriendships = 200;
  const userPool = await prisma.user.findMany();
  const friendships = [];
  const status = ['FRIENDS', 'PENDING', 'BLOCKED'];
  const idPairs: Set<string> = new Set();

  for (let i = 0; i < amountOfFriendships; i++) {
    let a = 0;
    let b = 0;
    do {
      a = faker.number.int({ min: 0, max: userPool.length - 1 });
      b = faker.number.int({ min: 0, max: userPool.length - 1 });
    } while (a === b || idPairs.has(`${a},${b}`) || idPairs.has(`${b},${a}`));

    idPairs.add(`${a},${b}`);

    const userA = userPool[a];
    const userB = userPool[b];

    const friendship = {
      user1_id: userA.id,
      user2_id: userB.id,
      status: status[faker.number.int({ min: 0, max: 2 })],
      created_at: faker.date.past(),
      updated_at: faker.date.recent(),
    };

    friendships.push(friendship);
  }

  const addFriendships = async () =>
    prisma.friendship.createMany({ data: friendships });

  addFriendships();
}

async function main() {
  await createUsers();
  await createDMs();
  await createChannels();
  await createUserAchievements();
  await createMatches();
  await createFriendships();
  console.log('Seed complete!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
