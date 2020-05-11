import { IsNotEmpty} from 'class-validator';
import { CreateUsers } from './createUsers.validator';

export class CreateUsersAny extends CreateUsers {
  @IsNotEmpty({
    message: 'Role es un campo requerido',
  })
  role: string;
}
