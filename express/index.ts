import http from 'http';
import express, { Application } from 'express';
import bodyParser from 'body-parser';
import { Http2Server } from 'http2';

export default (): { app: Application; server: Http2Server } => {
  const app = express();

  app.use(bodyParser.text());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Headers', '*');

    // handle CORS on local development
    if (process.env.NODE_ENV !== 'production') {
      res.setHeader('Access-Control-Allow-Origin', '*');

      if (req.method === 'OPTIONS') {
        res.status(200);
        res.send();

        return;
      }
    }
    next();
  });

  const server = http.createServer(app);

  return { app, server };
};
