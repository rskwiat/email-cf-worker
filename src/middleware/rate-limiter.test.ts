import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { _clearStoreForTesting, rateLimiter } from "./rate-limiter";

describe("rateLimiter middleware", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		_clearStoreForTesting();
	});

	it("should allow requests under the limit", async () => {
		const app = new Hono();
		app.use(rateLimiter());
		app.get("/", (c) => c.text("ok"));

		for (let i = 0; i < 10; i++) {
			const res = await app.request(
				new Request("http://localhost/", {
					headers: { "x-forwarded-for": "192.168.1.1" },
				}),
			);
			expect(res.status).toBe(200);
		}
	});

	it("should return 429 when limit exceeded", async () => {
		const app = new Hono();
		app.use(rateLimiter());
		app.get("/", (c) => c.text("ok"));

		// Make 11 requests (limit is 10)
		for (let i = 0; i < 11; i++) {
			const res = await app.request(
				new Request("http://localhost/", {
					headers: { "x-forwarded-for": "192.168.1.1" },
				}),
			);
			if (i < 10) {
				expect(res.status).toBe(200);
			} else {
				expect(res.status).toBe(429);
			}
		}
	});

	it("should set rate limit headers", async () => {
		const app = new Hono();
		app.use(rateLimiter());
		app.get("/", (c) => c.text("ok"));

		const res = await app.request(
			new Request("http://localhost/", {
				headers: { "x-forwarded-for": "192.168.1.1" },
			}),
		);

		expect(res.headers.get("X-RateLimit-Limit")).toBe("10");
		expect(res.headers.get("X-RateLimit-Remaining")).toBe("9");
		expect(res.headers.get("X-RateLimit-Reset")).toBeDefined();
	});

	it("should reset counter after 1 minute", async () => {
		const app = new Hono();
		app.use(rateLimiter());
		app.get("/", (c) => c.text("ok"));

		// Make 10 requests
		for (let i = 0; i < 10; i++) {
			await app.request(
				new Request("http://localhost/", {
					headers: { "x-forwarded-for": "192.168.1.1" },
				}),
			);
		}

		// Should be blocked
		let res = await app.request(
			new Request("http://localhost/", {
				headers: { "x-forwarded-for": "192.168.1.1" },
			}),
		);
		expect(res.status).toBe(429);

		// Advance time by 61 seconds
		vi.advanceTimersByTime(61000);

		// Should be allowed again
		res = await app.request(
			new Request("http://localhost/", {
				headers: { "x-forwarded-for": "192.168.1.1" },
			}),
		);
		expect(res.status).toBe(200);
	});

	it("should track separate IPs independently", async () => {
		const app = new Hono();
		app.use(rateLimiter());
		app.get("/", (c) => c.text("ok"));

		// IP 1 makes 10 requests
		for (let i = 0; i < 10; i++) {
			await app.request(
				new Request("http://localhost/", {
					headers: { "x-forwarded-for": "192.168.1.1" },
				}),
			);
		}

		// IP 2 should still work
		const res = await app.request(
			new Request("http://localhost/", {
				headers: { "x-forwarded-for": "192.168.1.2" },
			}),
		);
		expect(res.status).toBe(200);
	});
});
