export enum TokenType {
  refresh = 'refresh-token',
  verify = 'verify-token',
}

export interface IToken {
  id: number;
  email: string;
  token: string;
  type: TokenType;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
