-- PostgreSQL Schema v1.0 (Run on Railway Postgres)
-- Indexes optimized for chats/messages (high read/write)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (indexed on username/online)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(32) UNIQUE NOT NULL CHECK (username ~ '^[a-zA-Z0-9_]{3,32}$'),
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  avatar_url TEXT,
  bio TEXT,
  phone VARCHAR(20),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  online BOOLEAN DEFAULT FALSE,
  is_bot BOOLEAN DEFAULT FALSE,
  bot_commands JSONB DEFAULT '[]'::JSONB,  -- ["!help", "!ban"]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_online ON users(online);

-- Chats (private/group/channel)
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('private', 'group', 'channel')),
  title VARCHAR(100),
  avatar_url TEXT,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT TRUE,
  invite_link TEXT UNIQUE,
  settings JSONB DEFAULT '{}'::JSONB,  -- {muted: true, pinned: true}
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_chats_type ON chats(type);
CREATE INDEX idx_chats_created_by ON chats(created_by);

-- Chat Members (composite PK, roles)
CREATE TABLE chat_members (
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_message_id UUID REFERENCES messages(id),
  muted BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (chat_id, user_id)
);
CREATE INDEX idx_chat_members_user ON chat_members(user_id);

-- Messages (pagination by created_at)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  content TEXT,
  media_url TEXT,
  media_type VARCHAR(20),  -- 'image', 'video', 'audio', 'file'
  media_size BIGINT,
  edited BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  reactions JSONB DEFAULT '{}'::JSONB,  -- {"👍": ["user1", "user2"]}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_messages_chat_created ON messages(chat_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- Message Reads (optimized for bulk inserts)
CREATE TABLE message_reads (
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);

-- Calls (WebRTC history)
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  caller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  callee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('audio', 'video')),
  status VARCHAR(20) DEFAULT 'missed',  -- 'ongoing', 'completed'
  duration INTEGER,  -- seconds
  offer SDP TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- User Settings (per-user JSON)
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'dark',
  notifications JSONB DEFAULT '{"enabled": true}'::JSONB,
  privacy JSONB DEFAULT '{"lastSeen": "everyone"}'::JSONB,
  language VARCHAR(10) DEFAULT 'ru',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Redis Keys (used in code):
-- session:<userId> → JWT payload (EX 24h)
-- online:<userId> → 1 (EX 5m, auto-expire)
-- chat:<chatId>:typing:<userId> → 1 (EX 10s)
-- pubsub channels: chat:<chatId>, user:<userId>
