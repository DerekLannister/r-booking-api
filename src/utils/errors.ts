export class CustomError extends Error {
    statusCode: number;
  
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
      this.name = this.constructor.name;
    }
  }
  
  export class BusinessLogicError extends CustomError {
    constructor(message: string) {
      super(message, 400);
    }
  }
  
  export class ValidationError extends CustomError {
    constructor(message: string) {
      super(message, 400);
    }
  }
  
  export class NotFoundError extends CustomError {
    constructor(message: string) {
      super(message, 404);
    }
  }
  
  export class UnauthorizedError extends CustomError {
    constructor(message: string) {
      super(message, 401);
    }
  }
  
  export class DatabaseError extends CustomError {
    constructor(message: string) {
      super(message, 500);
    }
  }
