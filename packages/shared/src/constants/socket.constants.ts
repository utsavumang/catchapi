export const SOCKET_EVENTS = {
  // Client → Server
  JOIN_ENDPOINT: 'join:endpoint',
  LEAVE_ENDPOINT: 'leave:endpoint',

  // Server → Client
  PAYLOAD_NEW: 'payload:new',
  JOINED: 'joined',
} as const;
