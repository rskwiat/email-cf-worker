import { createApp } from "./lib/create-app";
import { rateLimiter } from "./middleware/rate-limiter";

const app = createApp();

app.use(rateLimiter());

app.get('/healthcheck', (c) => {
  return c.json({
    'status': 200,
    'message': 'OK',
    'timestamp': new Date().toISOString(),
  })
});


app.post('/echo', async (c) => {
  const body = await c.req.json();
  return c.json({
    'message': 'OK',
    'status': 200,
    'data': body,
  })
});

export default app
