export interface ITokenPayload {
  sub: number | string;
  roles?: string[];
}

export interface ITokenService {
  generateAccessToken(user: ITokenPayload): string;
  generateRefreshToken(userId: number | string): string;
  verifyAccessToken(token: string): ITokenPayload;
  verifyRefreshToken(token: string): { sub: number | string };
}
