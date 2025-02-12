import { BaseResponse } from "@/app/util/types";
import { serialize } from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const data: { password: string } = req.body;
    const password = data.password;
    const cookie = serialize("site-access-token", password, {
        httpOnly: true,
        path: "/",
        expires: new Date("9999-12-31T23:59:59Z"),
    });

    const response = await fetch(`${process.env.BASE_API_URL}/auth`, {
        headers: {
            Authorization: `Bearer ${
                decodeURIComponent(
                    data.password,
                )
            }`,
        }
    });
    const json: BaseResponse = await response.json();

    if (!json.success) {
        res.status(401).json({
            success: false,
        });
        return;
    }

    res.status(200).setHeader("Set-Cookie", cookie).json({
        success: true,
    });
}
