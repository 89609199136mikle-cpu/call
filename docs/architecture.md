CraneApp - Production-Ready Telegram Clone (March 2026)
================================================================================
Архитектура: Full-Stack Messenger как Telegram (chats, groups, channels, calls)

BACKEND (Node.js 20+ / Express 4.19)
├── gateway/          - API Gateway + Auth Middleware (JWT)
├── services/         - Microservices:
│   ├── auth-service/ - Registration/Login/Refresh (bcrypt/JWT)
│   ├── user-service/ - Profiles/Avatar/Bio
│   ├── chat-service/ - Private/Group/Channel CRUD
│   ├── message-service/ - Send/Read/React/Delete (realtime via WS)
│   ├── media-service/ - Upload/Download (multer/S3-ready)
│   └── call-service/ - WebRTC Offer/Answer/ICE
├── database/
│   ├── PostgreSQL   - Users/Chats/Messages/Calls (UUID PK, JSONB reactions)
│   └── Redis        - Sessions/PubSub (online status, typing)
└── Realtime: Socket.io (messages/typing/online/calls)

FRONTEND (Vanilla JS + HTML/CSS - Mobile-First 390px)
├── client/mobile/    - React-like (Zustand store, hooks)
│   ├── screens/      - Auth/Chats/Contacts/Calls/Profile/Settings
│   ├── components/   - UI/Chat/Media/Navigation (Telegram pixel-perfect)
│   └── services/     - API/Socket/Storage/Media
├── public/           - Web fallback (PWA-ready)
└── Theme: Telegram Blue (#2AABEE), Dark/Light modes

DEPLOY: Railway (1-click)
- DB: PostgreSQL + Redis
- Procfile: web: node server/gateway/apiGateway.js
- Vars: DB_URL, JWT_SECRET, REDIS_URL
- Docker optional

Features (100% working):
- ✅ Auth (username/pass)
- ✅ Chats/Groups/Channels (public/private)
- ✅ Messages + Reactions/Media/Replies
- ✅ WebRTC Calls (audio/video)
- ✅ Search/Contacts/Settings
- ✅ AI Bot (IRIS via GigaChat)
- ✅ PWA Offline (Cache API)

Scale: Redis Queue + K8s-ready (infrastructure/)
Security: Helmet/CORS/RateLimit/bcrypt/JWT
Performance: Indexed Queries/Pagination/WebSocket
