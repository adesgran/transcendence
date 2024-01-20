import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Redirect,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { randomBytes } from 'crypto';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { CurrentUser, CurrentUserID } from 'src/decorators/user.decorator';
import { TwoFAService } from './twoFA.service';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { Validate2FADto } from './dto/validate2fa.dto';
import { SetUsernameDto } from './dto/setusername.dto';

function generateRandomState(): string {
  return randomBytes(16).toString('hex');
}

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly twoFAService: TwoFAService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Get('/')
  @Redirect()
  redirectTo42Auth() {
    const api42_id = process.env.API42_ID;
    const api42_callback = encodeURIComponent(
      `${process.env.DOMAIN_NAME_BACK}/api/auth/callback`,
    );
    const state = generateRandomState();
    const url_auth42 = `https://api.intra.42.fr/oauth/authorize?client_id=${api42_id}&redirect_uri=${api42_callback}&response_type=code&state=${state}`;
    return { url: url_auth42 };
  }

  @Public()
  @Redirect()
  @Get('/callback')
  async callbackFrom42Auth(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    try {
      const user_infos_42 = await this.authService.fetchInfo42(code, state);
      const user = await this.authService.getUserbyId42(user_infos_42.id);
      if (user) {
        const redirect_url = await this.authService.signIn(
          user,
          user_infos_42.access_token,
        );
        return { url: redirect_url };
      } else {
        const token_tmp = await this.jwtService.signAsync(user_infos_42, {
          secret: process.env.APP_TMP_SECRET,
          expiresIn: '180s',
        });
        return {
          url: `${process.env.DOMAIN_NAME_FRONT}/auth/sign-up?id=${token_tmp}`,
        };
      }
    } catch (error) {
      return {
        message: error.response?.message,
        error: error.response?.error,
        statusCode: error.response?.statusCode,
        url: `${process.env.DOMAIN_NAME_FRONT}/auth`,
      };
    }
  }

  @Public()
  @Post('/sign-up')
  async signUp(@Query('id') id: string, @Body() body: SetUsernameDto) {
    const { username } = body;
    const user_infos_42 = await this.authService.checkTokenValidity(
      id,
      process.env.APP_TMP_SECRET,
    );
    await this.authService.registerUser(user_infos_42, username);
  }

  @Public()
  @Redirect()
  @Get('/redirect-to-home')
  async redirectIdentifiedUser(@Query('id') id: string) {
    const user_infos_42 = await this.authService.checkTokenValidity(
      id,
      process.env.APP_TMP_SECRET,
    );
    const token = await this.authService.generateJWTToken(
      await this.authService.getUserbyId42(user_infos_42.id),
      process.env.APP_SECRET,
      '3d',
    );
    return { url: `${process.env.DOMAIN_NAME_FRONT}/redirect/${token}` };
  }

// @Public()
// @Redirect()
// @Get('/impersonate/:id')
// async impersonateUser(@Param('id') id: number) {
//   const user = await this.userService.getUser(id);
//   const token = await this.authService.generateJWTToken(
//     user,
//     process.env.APP_SECRET,
//     '3d',
//   );
//   return { url: `${process.env.DOMAIN_NAME_FRONT}/redirect/${token}` };
// }

  @Post('/2fa/enable')
  async enableTwoFA(@CurrentUser() user: User) {
    const secret = await this.twoFAService.generateSecret(user);
    await this.userService.updateUser(user.id, {
      secret_2fa: secret,
      is_enable_2fa: true,
    });
  }

  @Get('2fa/qr-code')
  async getQRCode(@Res() response: Response, @CurrentUser() user: User) {
    const { otpauthUrl } = await this.twoFAService.generateQRCode(user);
    return this.twoFAService.pipeQrCodeStream(response, otpauthUrl);
  }

  @Post('/2fa/disable')
  async disableTwoFA(@CurrentUserID() id: number) {
    await this.userService.updateUser(id, {
      secret_2fa: null,
      is_enable_2fa: false,
    });
  }

  @Public()
  @Post('/2fa/submit/')
  async submit2FACode(
    @Query('jwt_id') jwt_id: string,
    @Body() body: Validate2FADto,
  ) {
    const payload = await this.authService.checkTokenValidity(
      jwt_id,
      process.env.APP_TMP_SECRET,
    );
    const user = await this.twoFAService.getUser(payload.id);
    this.twoFAService.check2FACodeValidity(body.code, user.secret_2fa);
    const token = await this.authService.generateJWTToken(
      user,
      process.env.APP_SECRET,
      '3d',
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'User is authenticated',
      token,
    };
  }
}
