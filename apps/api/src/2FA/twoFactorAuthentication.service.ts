import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { PrismaService } from 'src/prisma.service';
import { toFileStream } from 'qrcode';
import { Response } from 'express';
 
@Injectable()
export class TwoFactorAuthenticationService {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  public async generateTwoFactorAuthenticationSecret(user) 
  {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME, secret);
    await this.setTwoFactorAuthenticationSecret(secret, user.id);
 
    return {
      secret,
      otpauthUrl
    }
  }

  async setTwoFactorAuthenticationSecret(secret : string, userId : number)
  {
      return await this.prisma.user.update({    
        where: 
        {
          id : userId,
        },
        data: {
          secret_2fa: secret,
        },})
  }

  public async pipeQrCodeStream(stream: Response, otpauthUrl: string) 
  {
    return toFileStream(stream, otpauthUrl);
  }

  public isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.secret_2fa
    })
  }
}

