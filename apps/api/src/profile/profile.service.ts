import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LadderService } from 'src/ladder/ladder.service';

@Injectable()
export class ProfileService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly ladder: LadderService
        ) {}

    async profile(id: number) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: id,
            },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        const winCount = await this.prisma.matchPlayer.count({
            where: {
                user_id: id,
                winner: true,
            },
        });

        const looseCount = await this.prisma.matchPlayer.count({
            where: {
                user_id: id,
                winner: false,
            },
        });

        const achievementLvl = await this.prisma.userAchievement.count({
            where: {
                user_id: id,
            }
        })

        const rank = await this.ladder.getRank(user.id);
        console.log(rank);

        const res = {
            id: user.id,
            username: user.username,
            avatar_url: user.avatar_url,
            win_count: winCount,
            loose_count: looseCount,
            achievement_lvl: achievementLvl,
            rank: rank
        
        }

        return res;
    }

    async historic(id: number) {
    
        const matches = await this.prisma.matchPlayer.findMany({
            where: {
                user_id: id,
            },
            include: {
                match: {
                    include: {
                        players: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                match: {
                    updated_at: 'desc',
                },
            },
        });
    
        const matchHistory = matches.map((matchPlayer) => {
            const match = matchPlayer.match;

            const user1 = match.players[0].user.id === id ? match.players[0].user : match.players[1].user ;
            const user2 = match.players[0].user.id === id ? match.players[1].user : match.players[0].user ;
          
            const player1 = user1.username;
            const player2 = user2.username;
          
            const player1_avatar = user1.avatar_url;
            const player2_avatar = user2.avatar_url;
            const score1 = match.players[0].score;
            const score2 = match.players[1].score;
    
            return {
                id: match.id,
                player1: player1,
                player2: player2,
                player1_avatar: player1_avatar,
                player2_avatar: player2_avatar,
                score1: score1,
                score2: score2,
            };
        });
        return matchHistory;
    }
    
}