import {
  IsHexColor,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
@ValidatorConstraint({ name: 'ballSize', async: false })
class BallSizeConstraint implements ValidatorConstraintInterface {
  validate(ballSize: number, args: ValidationArguments) {
    const gamexsize = (args.object as any).gamexsize;
    const gameysize = (args.object as any).gameysize;
    const mindim = Math.min(gamexsize, gameysize);
    return ballSize >= 0.005 * mindim && ballSize <= 0.02 * mindim;
  }

  defaultMessage(args: ValidationArguments) {
    return `invalid ballSize`;
  }
}

@ValidatorConstraint({ name: 'ballSpeed', async: false })
class BallSpeedConstraint implements ValidatorConstraintInterface {
  validate(ballSpeed: number, args: ValidationArguments) {
    const gamexsize = (args.object as any).gamexsize;
    return ballSpeed >= 0.0025 * gamexsize && ballSpeed <= 0.02 * gamexsize;
  }

  defaultMessage(args: ValidationArguments) {
    return `invalid ballSpeed`;
  }
}

@ValidatorConstraint({ name: 'barSize', async: false })
class BarSizeConstraint implements ValidatorConstraintInterface {
  validate(barSize: number, args: ValidationArguments) {
    const gameysize = (args.object as any).gameysize;
    return barSize >= 0.05 * gameysize && barSize <= 0.5 * gameysize;
  }

  defaultMessage(args: ValidationArguments) {
    return `invalid barSize`;
  }
}

@ValidatorConstraint({ name: 'barDist', async: false })
class BarDistConstraint implements ValidatorConstraintInterface {
  validate(barDist: number, args: ValidationArguments) {
    const gamexsize = (args.object as any).gamexsize;
    return barDist <= gamexsize * 0.03 && barDist >= gamexsize * 0.0025;
  }

  defaultMessage(args: ValidationArguments) {
    return `invalid barDist`;
  }
}

@ValidatorConstraint({ name: 'barSpeed', async: false })
class BarSpeedConstraint implements ValidatorConstraintInterface {
  validate(barSpeed: number, args: ValidationArguments) {
    const gameysize = (args.object as any).gameysize;
    return barSpeed >= 0.01 * gameysize && barSpeed <= 0.05 * gameysize;
  }

  defaultMessage(args: ValidationArguments) {
    return `invalid barSpeed`;
  }
}

export class gameInfoDto {
  @IsOptional()
  @IsInt()
  @Max(100)
  barLarge?: number = 10;
  @IsOptional()
  @IsInt()
  @Validate(BarDistConstraint)
  barDist?: number = 20;
  @IsOptional()
  @IsInt()
  @Validate(BarSpeedConstraint)
  barSpeed?: number = 20;
  @IsOptional()
  @IsInt()
  @Validate(BarSizeConstraint)
  barSize?: number = 100;

  @IsOptional()
  @IsInt()
  @Validate(BallSpeedConstraint)
  ballSpeed?: number = 4;
  @IsOptional()
  @IsInt()
  @Validate(BallSizeConstraint)
  ballSize?: number = 10;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(8)
  oneScore?: number = 0;
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(8)
  twoScore?: number = 0;

  @IsOptional()
  @IsInt()
  borderSize?: number = 10;
  @IsOptional()
  @IsInt()
  numberSize?: number = 10;
  @IsOptional()
  @IsInt()
  menuSize?: number = 90;
  @IsOptional()
  @IsInt()
  numberSideDist?: number = 10;
  @IsOptional()
  @IsInt()
  numberTopDist?: number = 10;

  @IsOptional()
  @IsInt()
  ysize?: number = 500;
  @IsOptional()
  @IsInt()
  xsize?: number = 800;

  @IsOptional()
  @IsString()
  oneBarColor?: string = '#ffffff';
  @IsOptional()
  @IsString()
  twoBarColor?: string = '#ffffff';
  @IsOptional()
  @IsString()
  ballColor?: string = '#ffffff';
  @IsOptional()
  @IsString()
  backgroundColor?: string = '#000000';
  @IsOptional()
  @IsString()
  borderColor?: string = '#ffffff';
  @IsOptional()
  @IsString()
  oneScoreColor?: string = '#ffffff';
  @IsOptional()
  @IsString()
  twoScoreColor?: string = '#ffffff';
  @IsOptional()
  @IsHexColor()
  menuColor?: string = '#000000';
  // not in setting
  @IsOptional()
  @IsString()
  name?: string = 'My Custom Game';

  @IsOptional()
  @IsInt()
  oneBary?: number = 10;
  @IsOptional()
  @IsInt()
  twoBary?: number = 10;

  @IsOptional()
  @IsInt()
  gamey?: number = 400;
  @IsOptional()
  @IsInt()
  gamex?: number = 780;
  @IsOptional()
  @IsInt()
  @Max(1000)
  @Min(400)
  gamexsize?: number = 780;
  @IsOptional()
  @IsInt()
  @Max(1000)
  @Min(400)
  gameysize?: number = 380;

  @IsOptional()
  @IsInt()
  ballDirx?: number = -1;
  @IsOptional()
  @IsInt()
  ballDiry?: number = -0.4;
  @IsOptional()
  @IsInt()
  ballx?: number = 100;
  @IsOptional()
  @IsInt()
  bally?: number = 100;
  @IsOptional()
  @IsInt()
  ballDeb?: number = 10;

  @IsOptional()
  upBallSize: boolean = false;
  @IsOptional()
  downBallSize: boolean = false;

  @IsOptional()
  @IsInt()
  id?: number;
}
