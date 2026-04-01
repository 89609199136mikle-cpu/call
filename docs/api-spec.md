================================================================================
          CRANEAPP MESSENGER — API SPECIFICATION (REST & REAL-TIME)
================================================================================
Версия: 1.0.0
Базовый URL: https://api.craneapp.io/v1/
Формат данных: Application/JSON
Аутентификация: Bearer JWT (Access Token) + HttpOnly Cookie (Refresh Token)

--------------------------------------------------------------------------------
1. AUTH SERVICE (Аутентификация и сессии)
--------------------------------------------------------------------------------

1.1. POST /auth/send-otp
Описание: Отправка проверочного кода на номер телефона.
Request Body:
{
  "phone": "string",       // Формат: +79991234567
  "device_id": "string",   // Уникальный ID устройства для безопасности
  "app_version": "string"
}
Responses:
- 200 OK: { "status": "sent", "hash": "string", "timeout": 120 }
- 400 Bad Request: { "error": "INVALID_PHONE_FORMAT" }
- 429 Too Many Requests: { "error": "RATE_LIMIT_EXCEEDED" }

1.2. POST /auth/verify-otp
Описание: Проверка кода и выдача токенов.
Request Body:
{
  "phone": "string",
  "code": "string",        // 6 цифр
  "hash": "string"         // Хэш из предыдущего запроса
}
Responses:
- 200 OK: { 
    "user": { "id": "uuid", "is_new": boolean }, 
    "access_token": "jwt_string",
    "expires_in": 900 
  } (Refresh Token устанавливается в Set-Cookie)
- 401 Unauthorized: { "error": "INVALID_CODE" }
- 410 Gone: { "error": "CODE_EXPIRED" }

1.3. POST /auth/refresh
Описание: Обновление Access Token.
Cookie: refresh_token=uuid
Responses:
- 200 OK: { "access_token": "string" }
- 403 Forbidden: { "error": "REFRESH_TOKEN_INVALID" }

--------------------------------------------------------------------------------
2. USER SERVICE (Управление профилем и контактами)
--------------------------------------------------------------------------------

2.1. GET /users/me
Описание: Получение данных текущего пользователя.
Auth: Required
Responses:
- 200 OK: {
    "id": "uuid",
    "phone": "string",
    "username": "string",
    "first_name": "string",
    "last_name": "string",
    "avatar_url": "url",
    "settings": { ... }
  }

2.2. PATCH /users/update
Описание: Обновление профиля.
Request Body: { "first_name": "str", "last_name": "str", "bio": "str", "username": "str" }
Responses: 200 OK / 409 Conflict (если username занят)

2.3. GET /users/contacts
Описание: Список контактов пользователя.
Responses: 200 OK: [ { "id": "uuid", "name": "str", "status": "online" }, ... ]

2.4. POST /users/contacts/sync
Описание: Синхронизация телефонной книги.
Request Body: { "phones": ["+79001112233", "..."] }
Responses: 200 OK: [ { "phone": "...", "user_id": "uuid" } ]

--------------------------------------------------------------------------------
3. CHAT SERVICE (Управление чатами и группами)
--------------------------------------------------------------------------------

3.1. GET /chats
Описание: Получение списка всех чатов пользователя (с последним сообщением).
Query: ?limit=20&offset=0
Responses: 200 OK: [
  {
    "id": "uuid",
    "type": "private|group|channel",
    "title": "string",
    "last_message": { "text": "...", "time": "..." },
    "unread_count": number,
    "is_pinned": boolean
  }
]

3.2. POST /chats/create
Описание: Создание нового чата или группы.
Request Body:
{
  "type": "group",
  "title": "Team Alpha",
  "participants": ["uuid1", "uuid2"]
}
Responses: 201 Created: { "chat_id": "uuid" }

3.3. DELETE /chats/:id
Описание: Удаление чата или выход из группы.

--------------------------------------------------------------------------------
4. MESSAGE SERVICE (Архив сообщений)
--------------------------------------------------------------------------------

4.1. GET /messages/:chat_id
Описание: История сообщений в конкретном чате.
Query: ?limit=50&before_id=number
Responses: 200 OK: [
  {
    "id": "bigint",
    "sender_id": "uuid",
    "content": "text",
    "media": { "type": "image", "url": "..." },
    "reply_to": "id",
    "reactions": [ { "emoji": "👍", "count": 2 } ],
    "created_at": "timestamp"
  }
]

4.2. POST /messages/search
Описание: Глобальный поиск по сообщениям.
Request Body: { "query": "string" }
