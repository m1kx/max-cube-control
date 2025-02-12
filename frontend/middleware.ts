import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const requestToken = request.cookies.get("site-access-token")?.value;

    const loginPath = "/auth/login";
    const isLoginPath = request.nextUrl.pathname === loginPath;

    if (isLoginPath && requestToken) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    if (!isLoginPath && (!requestToken)) {
        return NextResponse.redirect(new URL(loginPath, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|manifest|_next/image|favicon.ico|web-app-manifest-512x512.png|web-app-manifest-192x192.png).*)",
    ],
};
