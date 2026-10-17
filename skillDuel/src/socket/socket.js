const url =import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? "http://localhost:5000" : undefined);
socket = io(url, {
  withCredentials: true,
  autoConnect: false,
});

let socket;

/**
 * Returns a shared socket.io client instance. Call .connect() when the user
 * enters the dashboard and .disconnect() when they leave, rather than
 * creating a new connection on every render.
 */
export const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      withCredentials: true,
      autoConnect: false,
    });
  }
  return socket;
};
