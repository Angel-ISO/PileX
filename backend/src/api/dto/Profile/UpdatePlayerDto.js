export class UpdatePlayerDto {
  constructor({ username, bornDate, color, password } = {}) {
    if (username !== undefined) this.username = username;
    if (bornDate !== undefined) this.bornDate = bornDate;
    if (password !== undefined) this.password = password;
  }

  static fromRequest(body = {}) {
    return new UpdatePlayerDto({
      username: body.username,
      bornDate: body.bornDate,
      password: body.password,
    });
  }
}
