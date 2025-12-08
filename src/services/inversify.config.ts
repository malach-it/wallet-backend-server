import { Container } from "inversify";
import { Storage } from "@wwwallet/server-core";
import { config } from '../../config';
import { TYPES  } from "./types";
import { WalletKeystore, SocketManagerServiceInterface, WalletKeystoreManager } from "./interfaces";
import "reflect-metadata";
import { SocketManagerService } from "./SocketManagerService";
import { ClientKeystoreService } from "./ClientKeystoreService";
import { WalletKeystoreManagerService } from "./WalletKeystoreManagerService";

const appContainer = new Container();

appContainer.bind<WalletKeystore>(TYPES.ClientKeystoreService)
	.to(ClientKeystoreService)

appContainer.bind<WalletKeystoreManager>(TYPES.WalletKeystoreManagerService)
	.to(WalletKeystoreManagerService)

appContainer.bind<SocketManagerServiceInterface>(TYPES.SocketManagerService)
	.to(SocketManagerService)

const storage = new Storage({
	events_path: "./events",
	secret_base: config.appSecret,
	issuer_url: config.url,
	authorization_challenge_ttl: 60,
	access_token_ttl: 60,
})

appContainer.bind<Storage>(TYPES.EventStorage)
	.toConstantValue(storage)

export { appContainer }
