// import { applyDecorators, SetMetadata } from '@nestjs/common';

// export const AUTHZ_META_KEY = 'authz_meta';

// export type AuthzMatchMode = 'any' | 'all';

// export interface AuthzOptions {
//   roles?: string[];
//   permissions?: string[];
//   /**
//    * 'any' (за замовчуванням) — достатньо хоча б однієї умови/ролі/дозволу
//    * 'all' — мають виконуватись усі вказані ролі та дозволи
//    */
//   mode?: AuthzMatchMode;
// }

// export const Authz = (options: AuthzOptions) =>
//   SetMetadata(AUTHZ_META_KEY, {
//     mode: options.mode ?? 'any',
//     roles: options.roles ?? [],
//     permissions: options.permissions ?? [],
//   } satisfies Required<AuthzOptions>);

// /**
//  * Доступ за ролями. За замовчуванням спрацьовує, якщо є хоча б одна з ролей.
//  * Приклад: @Roles('admin', 'editor') або @Roles(['admin', 'editor'], 'all')
//  */
// export const Roles = (roles: string | string[], mode: AuthzMatchMode = 'any') =>
//   applyDecorators(
//     Authz({
//       roles: Array.isArray(roles) ? roles : [roles],
//       mode,
//     }),
//   );

// /**
//  * Доступ за permissions. За замовчуванням спрацьовує, якщо є хоча б один permission.
//  * Приклад: @Permissions('users:read', 'users:ban') або @Permissions(['users:read', 'users:ban'], 'all')
//  */
// export const Permissions = (
//   permissions: string | string[],
//   mode: AuthzMatchMode = 'any',
// ) =>
//   applyDecorators(
//     Authz({
//       permissions: Array.isArray(permissions) ? permissions : [permissions],
//       mode,
//     }),
//   );















//   //------------------------------------------------------------
//   import {
//   CanActivate,
//   ExecutionContext,
//   ForbiddenException,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { Request } from 'express';
// import {
//   AUTHZ_META_KEY,
//   AuthzOptions,
// } from './authz.decorator.js';
// import { ITokenPayload } from '../tokens/interfaces/TokensProvider.interface.js';

// @Injectable()
// export class AuthzGuard implements CanActivate {
//   constructor(private readonly reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     const meta = this.reflector.getAllAndOverride<
//       Required<AuthzOptions> | undefined
//     >(AUTHZ_META_KEY, [context.getHandler(), context.getClass()]);

//     // Якщо декоратор авторизації не повішаний — додаткових обмежень ролей/прав немає
//     if (!meta) {
//       return true;
//     }

//     const request = context.switchToHttp().getRequest<Request & { user?: ITokenPayload }>();
//     const user = request.user;

//     if (!user) {
//       throw new UnauthorizedException('User payload is missing in request');
//     }

//     const userRoles = new Set(user.roles ?? []);
//     const userPermissions = new Set(user.permissions ?? []);

//     const hasRolesConfigured = meta.roles.length > 0;
//     const hasPermissionsConfigured = meta.permissions.length > 0;

//     if (!hasRolesConfigured && !hasPermissionsConfigured) {
//       return true;
//     }

//     const roleMatches =
//       meta.mode === 'all'
//         ? meta.roles.every((role) => userRoles.has(role))
//         : meta.roles.some((role) => userRoles.has(role));

//     const permissionMatches =
//       meta.mode === 'all'
//         ? meta.permissions.every((perm) => userPermissions.has(perm))
//         : meta.permissions.some((perm) => userPermissions.has(perm));

//     let allowed: boolean;

//     if (hasRolesConfigured && hasPermissionsConfigured) {
//       allowed =
//         meta.mode === 'all'
//           ? roleMatches && permissionMatches
//           : roleMatches || permissionMatches;
//     } else if (hasRolesConfigured) {
//       allowed = roleMatches;
//     } else {
//       allowed = permissionMatches;
//     }

//     if (!allowed) {
//       throw new ForbiddenException('Insufficient role or permission');
//     }

//     return true;
//   }
// }







// //--------------------------------------------------------------
// import { Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
// import { Authz, Permissions, Roles } from './authz.decorator.js';
// import { AuthzGuard } from './authz.guard.js';

// @Controller('episodes')
// @UseGuards(JwtAuthGuard, AuthzGuard) // спочатку перевіряємо JWT, потім ролі/permissions
// export class EpisodesController {
//   // Будь-яка з ролей: admin АБО moderator
//   @Get()
//   @Roles(['admin', 'moderator'], 'any')
//   findAll() {
//     return [];
//   }

//   // Обов'язково обидві ролі: admin І editor
//   @Post()
//   @Roles(['admin', 'editor'], 'all')
//   create() {
//     return {};
//   }

//   // Достатньо одного дозволу
//   @Get('stats')
//   @Permissions('stats:read')
//   getStats() {
//     return {};
//   }

//   // Потрібні ОБИДВА дозволи
//   @Delete(':id')
//   @Permissions(['episodes:delete', 'episodes:archive'], 'all')
//   remove() {
//     return {};
//   }

//   // Комбінація ролей і permissions:
//   // mode: 'any' -> достатньо ролі 'admin' АБО permission 'episodes:publish'
//   @Post(':id/publish')
//   @Authz({
//     roles: ['admin'],
//     permissions: ['episodes:publish'],
//     mode: 'any',
//   })
//   publishAny() {
//     return {};
//   }

//   // mode: 'all' -> потрібна роль 'moderator' І permission 'episodes:moderate'
//   @Post(':id/moderate')
//   @Authz({
//     roles: ['moderator'],
//     permissions: ['episodes:moderate'],
//     mode: 'all',
//   })
//   moderateAll() {
//     return {};
//   }
// }



