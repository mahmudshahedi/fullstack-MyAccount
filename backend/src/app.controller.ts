import { Controller, Get, Post, Put, Delete, Body, Param, BadRequestException, ForbiddenException, Res, Req   } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from './users/schemas/user.schema';
import * as svgCaptcha from 'svg-captcha';
import type { Response } from 'express';
import type { Request } from 'express';


@Controller('users')
export class AppController {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  private checkSuperAdmin(role: UserRole) {
    if (role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Access denied');
    }
  }

  @Post('add')
  async addUser(
    @Body() body: { username: string; password: string; name: string; email: string; role?: UserRole; requesterRole: UserRole }
  ) {
    this.checkSuperAdmin(body.requesterRole);

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = new this.userModel({ ...body, password: hashedPassword });
    return user.save();
  }

  @Put('edit/:id')
  async editUser(
    @Param('id') id: string,
    @Body() body: { username?: string; password?: string; name?: string; email?: string; role?: UserRole; requesterRole: UserRole }
  ) {
    this.checkSuperAdmin(body.requesterRole);

    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }
    const updated = await this.userModel.findByIdAndUpdate(id, body, { new: true });
    if (!updated) throw new BadRequestException('User not found');
    return updated;
  }

  @Delete('delete/:id')
  async deleteUser(
    @Param('id') id: string,
    @Body() body: { requesterRole: UserRole }
  ) {
    this.checkSuperAdmin(body.requesterRole);

    const deleted = await this.userModel.findByIdAndDelete(id);
    if (!deleted) throw new BadRequestException('User not found');
    return { message: 'User deleted successfully' };
  }

 @Post('login')
async login(
  @Req() req: Request,
  @Body() body: { username: string; password: string; captcha: string }
) {
  // Validate captcha from server-side session
  const sessionCaptcha = (req.session as any)?.captcha;
  if (!body.captcha || !sessionCaptcha || body.captcha.toLowerCase() !== sessionCaptcha.toLowerCase()) {
    throw new BadRequestException('Invalid captcha');
  }
  // optionally clear stored captcha after validation
  (req.session as any).captcha = null;

  const user = await this.userModel.findOne({ username: body.username });
  if (!user) throw new BadRequestException('Invalid credentials');

  const isMatch = await bcrypt.compare(body.password, user.password);
  if (!isMatch) throw new BadRequestException('Invalid credentials');

  return { id: user._id, username: user.username, role: user.role };
}

  @Get()
  async getAllUsers() {
    return this.userModel.find();
  }

  @Get('captcha')
  getCaptcha(@Req() req: Request, @Res() res: Response) {
    const captcha = svgCaptcha.create({
      size: 6,
      noise: 3,
      color: true,
      background: '#f0f0f0',
    });
      (req.session as any).captcha = captcha.text;
    res.type('svg');
    res.send(captcha.data);
  }
}
