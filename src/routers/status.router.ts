import express, { Request, Response, Router } from 'express';
import { Storage } from "@wwwallet/server-core";
import { appContainer } from '../services/inversify.config';
import { TYPES } from '../services/types';

/**
 * "/status" endpoint that returns 200
 * as a response if the service is working
 */
const statusRouter: Router = express.Router();

const eventStorage = appContainer.get<Storage>(TYPES.EventStorage);

statusRouter.post('/', async (req: Request, res: Response) => {
	const uuid = req.body.uuid
	const response = await eventStorage.authorizationChallenge(req, { uuid })

	if (response.status === 200) {
		return res.status(200).send({
			...response.body,
			online: true
		});
	}

	return res.status(200).send({ online: true })
});

export {
	statusRouter
}
