import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config';
import { tokenStorage } from './storage';

/**
 * Shared realtime connection for chat. One socket per app session; screens
 * subscribe/unsubscribe to events. Auth uses the current access token from
 * storage, refreshed on every (re)connect attempt so a rotated token is used.
 */
let socket: Socket | null = null;

export async function getSocket(): Promise<Socket> {
  const { access } = await tokenStorage.get();
  if (!socket) {
    socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      auth: { token: access },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 8_000,
      autoConnect: true,
    });
    // Keep the handshake token current across reconnects.
    socket.io.on('reconnect_attempt', () => {
      void tokenStorage.get().then(({ access: a }) => {
        if (socket) socket.auth = { token: a };
      });
    });
  } else if (!socket.connected) {
    socket.auth = { token: access };
    socket.connect();
  }
  return socket;
}

export function getSocketSync(): Socket | null {
  return socket;
}

/** Tear down on sign-out so the next user gets a fresh, correctly-authed socket. */
export function disconnectSocket(): void {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
}
