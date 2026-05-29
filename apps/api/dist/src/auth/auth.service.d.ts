import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export interface RegisterDto {
    email: string;
    password: string;
    name: string;
    role?: string;
}
export interface LoginDto {
    email: string;
    password: string;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    private readonly SALT_ROUNDS;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        expiresIn: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        expiresIn: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    }>;
    me(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        resourceId: string | null;
        lastLoginAt: Date | null;
        createdAt: Date;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        ok: boolean;
    }>;
    private buildTokenResponse;
}
