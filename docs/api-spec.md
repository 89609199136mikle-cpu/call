CraneApp API v1 (https://api.craneapp.com/api/v1) - OpenAPI 3.0 compatible
================================================================================
Base URL: /api/v1
Auth: Bearer <JWT> (expires 24h, refresh 7d)

AUTH (/auth) - No auth required
- POST /auth/register
  Body: {username: string(3-32), password: string(8+), firstName?: string}
  201: {accessToken, refreshToken, user: {id, username, firstName}}

- POST /auth/login
  Body: {username, password}
  200: {accessToken, refreshToken, user}

- POST /auth/refresh
  Body: {refreshToken}
  200: {accessToken, user}

- POST /auth/logout
  Header: Bearer <access>
  204: No content (blacklist refresh)

USERS (/users) - Auth required
- GET /users/me → 200: user profile
- PUT /users/me {firstName, bio, avatar} → 200: updated
- GET /users/search?q=query → 200: [{id, username, firstName, avatar}]

CHATS (/chats) - Auth required
- GET /chats?limit=50&offset=0 → 200: [{id, title, type, avatar, membersCount}]
- POST /chats {title, type: "private|group|channel", members?: [userId]}
- GET /chats/:id → 200: chat details
- PUT /chats/:id {title, avatar} → 200
- POST /chats/:id/leave → 204
- POST /chats/:id/members {userId, role: "admin|member"} → 201

MESSAGES (/chats/:chatId/messages) - Auth required
- GET /messages?limit=50&before=uuid → 200: [{id, senderId, content, mediaUrl, reactions, createdAt}]
- POST /messages {content?, mediaUrl?, replyToId?, mediaType?} → 201: message
- PUT /messages/:id {content} → 200 (edit)
- DELETE /messages/:id → 204
- POST /messages/:id/reactions {emoji} → 200

MEDIA (/media)
- POST /upload (multipart/form-data: file) → 201: {url, thumbnail, size, mimeType}
- GET /:id → file stream

CALLS (/calls)
- POST /offer {calleeId, offer: RTCSessionDescription, type: "audio|video"} → 201
- POST /answer {offerId, answer} → 200
- POST /ice-candidate {candidate, offerId} → 200

ERRORS:
400 Bad Request, 401 Unauthorized, 403 Forbidden, 429 Rate Limit, 500 Internal
Headers: Content-Type: application/json
