import { ipKeyGenerator } from "express-rate-limit";
import type { Request } from "express";

export const emailAndIpKeyGenerator = (req: Request) => {
    const email = (req.body?.email ?? "").trim().toLowerCase();

    return email
        ? `${ipKeyGenerator(req.ip as string)}:${email}`
        : ipKeyGenerator(req.ip as string);
};
