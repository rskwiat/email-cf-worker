import { Hono } from "hono";

const app = new Hono();

export function createApp() {
	app.notFound((c) => {
		return c.json(
			{
				message: `Not Found - ${c.req.path}`,
			},
			404,
		);
	});

	app.onError((err, c) => {
		return c.json(
			{
				message: err.message,
			},
			500,
		);
	});

	return app;
}
