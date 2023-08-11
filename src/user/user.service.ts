import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt.payload';
import { UserProfileInput } from './types/profile.input';
import { UserInput } from './types/user.input';
import { UserSignInInput } from './types/user.signin.input';
import { UserEntity } from './user.entity';
import * as crypto from 'crypto-js';
import { validateEmail } from '../common/validations';
import { error } from 'console';

@Injectable()
export class UserService {
  constructor(private jwtService: JwtService) {}

  async signup(userInput: UserInput) {
    const user = new UserEntity();

    if (userInput.email) {
      const isValid = validateEmail(userInput.email);
      if (isValid) {
        user.email = userInput.email;
      }
    }

    user.firstName = userInput.firstName;

    user.lastName = userInput.lastName;

    user.password = `${crypto.MD5(userInput.password)}`;

    const result = await user.save();

    return result;
  }

  async profile(user: UserEntity) {
    return user;
  }

  async updateProfile(user: UserEntity, input: UserProfileInput) {
    user.email = input.email;
    user.firstName = input.firstName;
    user.lastName = input.lastName;

    const result = user.save();
    return result;
  }

  async signin(userInput: UserSignInInput) {
    const { email, password } = userInput;

    const user = await UserEntity.findOne({ where: { email: email } });

    if (!user) {
      throw new error('Please enter valid inputs');
    }

    if (!user.validatePassword(password)) {
      return null;
    }
    console.log(user);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const payload: JwtPayload = {
      email: user.email,
      id: user.id,
    };

    const token = await this.jwtService.sign(payload);

    return { token, user };
  }
}
