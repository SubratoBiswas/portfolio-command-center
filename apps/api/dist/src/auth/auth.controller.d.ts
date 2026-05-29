import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly svc;
    constructor(svc: AuthService);
    /** Register a new user account. Open endpoint. */
    register(body: {
        email: string;
        password: string;
        name: string;
        role?: string;
    }): Promise<{
        accessToken: string;
        expiresIn: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    }>;
    /** Login and receive a JWT access token. Open endpoint. */
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        accessToken: string;
        expiresIn: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    }>;
    /** Return the authenticated user's profile. */
    me(user: {
        id: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        resourceId: string | null;
        lastLoginAt: Date | null;
        createdAt: Date;
    }>;
    /** Change password for the authenticated user. */
    changePassword(user: {
        id: string;
    }, body: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        ok: boolean;
    }>;
}
