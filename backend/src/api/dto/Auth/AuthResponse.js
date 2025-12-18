
export default class AuthResponse {
  constructor({ username = null, message, jwt = null, status = false }) {
    this.username = username;
    this.message = message;
    this.jwt = jwt;
    this.status = status;
  }
}