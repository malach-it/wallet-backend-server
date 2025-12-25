import express, { Express, Request } from 'express';
import { Storage } from '@wwwallet/server-core';
import { config } from '../config';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userController from './routers/user.router';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { statusRouter } from './routers/status.router';
import { storageRouter } from './routers/storage.router';
import { replacerBufferToTaggedBase64Url, reviverTaggedBase64UrlToBuffer } from './util/util';
import http from 'http';
import { appContainer } from './services/inversify.config';
import { SocketManagerServiceInterface } from './services/interfaces';
import { TYPES } from './services/types';
import { credentialIssuerRouter } from './routers/credential_issuer.router';
import { proxyRouter } from './routers/proxy.router';
import { helperRouter } from './routers/helper.router';
import { verifierRouter } from './routers/verifier.router';
import { walletProviderRouter } from './routers/wallet_provider.router';


export const app: Express = express();
// __dirname is "/path/to/dist/src"

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: '17mb' }));
app.use(bodyParser.json({ reviver: reviverTaggedBase64UrlToBuffer, limit: '17mb' }));
app.set('json replacer', replacerBufferToTaggedBase64Url);
app.use(express.json({ type: ["application/jwk+json"] }));
app.use(express.text({ type: ["application/jose"] }));

app.use(express.static('public'));
// __dirname is "/path/to/dist/src"
// public is located at "/path/to/dist/src"
app.use(cors({
	credentials: true,
	origin: [config.walletClientUrl],
	allowedHeaders: [
		'Authorization',
		'DPoP',
		'Content-Type',
		'If-None-Match',
		'X-Private-Data-If-Match',
		'X-Private-Data-If-None-Match',
	],
	exposedHeaders: ['X-Private-Data-ETag'],
}));


// define routes and middleware here
app.use('/status', statusRouter);
app.use('/user', userController);

// --- Storage

const eventStorage = appContainer.get<Storage>(TYPES.EventStorage);

app.get("/event-store/events", async (req, res) => {
	const response = await eventStorage.getEvents(req as Request);

	return res.status(response.status).send(response.body);
});

app.put("/event-store/events/:hash", async (req, res) => {
	const response = await eventStorage.storeEvent(req);

	return res.status(response.status).send(response.body);
});

app.use(AuthMiddleware);

// all the following endpoints are guarded by the AuthMiddleware
app.use('/storage', storageRouter);
app.use('/issuer', credentialIssuerRouter);
app.use('/proxy', proxyRouter);
app.use('/helper', helperRouter);
app.use('/verifier', verifierRouter);
app.use('/wallet-provider', walletProviderRouter);

const server = http.createServer(app);
appContainer.get<SocketManagerServiceInterface>(TYPES.SocketManagerService).register(server);

server.listen(config.port, () => {
	console.log(`Wallet Backend Server listening with ${config.url}`)
});
