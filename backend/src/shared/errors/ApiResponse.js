export default class ApiResponse extends Error {
  constructor(statusCode, message = null) {
    super();
    this.statusCode = statusCode;
    this.message = message || ApiResponse.getDefaultMessage(statusCode);
  }

  static getDefaultMessage(statusCode) {
    switch (statusCode) {
      case 400:
        return 'A bad request, you have made.';  
      case 401:
        return 'Unauthorized, you are not allowed to do this.';
      case 403:
        return 'Forbidden, you are not allowed to do this.';
      case 404:
        return 'Resource not found, it was.';
      case 500:
        return 'Errors are the path to the dark side. Errors lead to anger. Anger leads to hate. Hate leads to career change.';
      default:
        return 'An unexpected error has occurred.';
    }
  }
}
