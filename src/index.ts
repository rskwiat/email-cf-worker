import { createApp } from './lib/create-app';

const app = createApp();

app.get('/healthcheck', (c) => {
  return c.json({
    'message': 'OK',
    'status': 200,
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
