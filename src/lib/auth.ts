// lib/authorization.ts
import jwt from "jsonwebtoken";
import {config} from "@/lib/config";

export function verifyToken(token: string) {
    try {
        const decoded = jwt.verify(token,config.jwtKey.jwtKey as string);
        return { valid: true, decoded };
    } catch (err) {
        return { valid: false, error: err };
    }
}
