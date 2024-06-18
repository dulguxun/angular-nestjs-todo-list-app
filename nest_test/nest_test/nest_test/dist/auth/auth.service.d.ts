import { JwtService } from '@nestjs/jwt';
export interface User {
    name: string;
    email: string;
    password: string;
}
export declare class AuthService {
    private readonly jwtService;
    private users;
    constructor(jwtService: JwtService);
    login(email: string, password: string): {
        success: boolean;
        accessToken?: string;
    };
    validateUser(username: string, password: string): Promise<any>;
}
