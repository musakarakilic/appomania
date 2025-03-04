/* An array of routes that are accesible to the public
    These routes do not require authentication
    @type {string[]}
*/

export const publicRoutes = [
    "/",
    "/auth/new-verification"
]

/* An array of routes that are used for authentication
    These routes will redirect logged in users to /settings
    @type {string[]}
*/

export const authRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/error",
    "/auth/reset",
    "/auth/new-password",
]

/* The prefix for Apı auth routes
    Routes that start with this prefix are used for api
    @type {string[]}
*/

export const apiAuthPrefix = "/api/auth"

/* 
    The default redirect path after loggin in
    @type {string[]}
*/

export const DEFAULT_LOGIN_REDIRECT = "/settings"

export const routes = {
    appointments: {
        workingHours: "/settings/working-hours",
        services: "/settings/services",
    },
    settings: {
        workingHours: "/settings/working-hours",
        services: "/settings/services",
        notifications: "/settings/notifications",
        account: "/settings/account",
        staff: "/settings/staff",
    }
}