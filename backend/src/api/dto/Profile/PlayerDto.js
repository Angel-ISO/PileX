export class PlayerDto {
  constructor({ username, bornDate, color, password }) {
    this.username = username;
    this.bornDate = bornDate;
    this.password = password;
  }

  static fromRequest(body) {
    return new PlayerDto({
      username: body.username,
      bornDate: body.bornDate,
      password: body.password,
    });
  }
}
