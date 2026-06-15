import { createMiddleware } from "hono/factory";
import { routePath } from "hono/route";
import { HTTPException } from "hono/http-exception";

const store = new Map();
const requests = 10; // Max requests per minute

export const rateLimiter = () => {
  return createMiddleware(async (c, next) => {
    const ip = c.req.header('x-forwarded-for') || 'unknown';
    const now = Date.now();
    
    const data = store.get(ip) || {
      count: 0,
      resetTime: now + 60000, // 1 minute
    }

    if (now > data.resetTime) {
      data.count = 0
      data.resetTime = now + 60000
    }

    if (data.count > requests) {
      throw new HTTPException(429, { message: 'Too Many Requests' })
    }
    
    c.header('X-RateLimit-Limit', requests.toString())
    c.header('X-RateLimit-Remaining', (requests - data.count).toString())
    c.header('X-RateLimit-Reset', data.resetTime.toString())

    await next();
  });
}