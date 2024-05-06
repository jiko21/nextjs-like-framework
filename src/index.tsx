import { Hono } from 'hono'
import { _genPathInfo, genRoute } from './middleware/ssrMiddleware';
const app = new Hono()

const page = await genRoute();

app.route('/', page);

export default app
