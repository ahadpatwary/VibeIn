export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public roles: string[] = [],
  ) {}

  addRole(role: string) {
    if (!this.roles.includes(role)) this.roles.push(role);
  }

  removeRole(role: string) {
    this.roles = this.roles.filter(r => r !== role);
  }
}
