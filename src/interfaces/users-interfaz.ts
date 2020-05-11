class Roles {
  priority: number;
  _id: string;
  description: string;
  permissions: [any];
}
// tslint:disable-next-line: max-classes-per-file
export class Users {
    readonly _id: string;
    readonly user: string;
    readonly password: string;
    readonly role: Roles;
    readonly habilitado: boolean;
  }
