import * as net from 'net';
import { RsBuffer } from './net/rs-buffer';
import { World } from './world/world';
import { ClientConnection } from './net/client-connection';
import { GameCache } from './cache/game-cache';
import { logger } from './util/logger';

const GAME_SERVER_PORT = 43594;

export const gameCache = new GameCache();
export const world = new World();
world.chunkManager.generateCollisionMaps();

export function runGameServer(): void {
    net.createServer(socket => {
        logger.info('Socket opened');
        // socket.setNoDelay(true);
        let clientConnection = new ClientConnection(socket);

        socket.on('data', data => {
            if(clientConnection) {
                clientConnection.parseIncomingData(new RsBuffer(data));
            }
        });

        socket.on('close', () => {
            if(clientConnection) {
                clientConnection.connectionDestroyed();
                clientConnection = null;
            }
        });

        socket.on('error', error => {
            socket.destroy();
            logger.error('Socket destroyed due to connection error.');
        });
    }).listen(GAME_SERVER_PORT, '127.0.0.1');

    logger.info(`Game server listening on port ${GAME_SERVER_PORT}.`);
}
