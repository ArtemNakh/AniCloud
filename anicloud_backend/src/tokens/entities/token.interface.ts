export enum TokenType {
  refresh,
  verify,
}

export interface IToken {
  id: number;
  email: string;
  token: string;
  type: TokenType;
  createdAt: Date;
  updatedAt: Date;
}
