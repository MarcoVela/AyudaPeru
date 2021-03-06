import { Body, Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { Contactable } from '../../common/interfaces/contactable.interface';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getOwnInfo(@Body() body: { credentials: Contactable }) {
    try {
      const { credentials } = body;
      return await this.usersService.getUsuarioById(credentials.id);
    } catch (e) {
      let exception = new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
      if (e.message === UsersService.userNotFoundError.message) {
        exception = new HttpException(e.message, HttpStatus.NOT_FOUND);
      }
      throw exception;
    }
  }
}
