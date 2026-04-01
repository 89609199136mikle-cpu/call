--------------------------------------------------------------------------------
5. SOCKET.IO EVENTS (Двустороннее взаимодействие)
--------------------------------------------------------------------------------
Namespace: /chat
Auth: JWT в заголовке 'Authorization' при handshake.

5.1. MESSAGE FLOW (Исходящие события от клиента)
-----------------------------------------------

- "msg:send"
  Payload: { "chat_id": "uuid", "text": "str", "temp_id": "client_uuid", "media_id": "opt_str" }
  Logic: Сервер сохраняет в DB и делает трансляцию.

- "msg:edit"
  Payload: { "message_id": "bigint", "new_text": "str" }

- "msg:delete"
  Payload: { "message_ids": ["bigint"], "for_everyone": boolean }

- "msg:read"
  Payload: { "chat_id": "uuid", "last_message_id": "bigint" }

- "chat:typing"
  Payload: { "chat_id": "uuid", "status": "typing|uploading|recording" }

5.2. SERVER BROADCASTS (События от сервера к клиенту)
----------------------------------------------------

- "msg:new"
  Payload: { "message": { ...полный объект... } }

- "msg:update"
  Payload: { "message_id": "bigint", "updates": { ... } }

- "chat:status_update"
  Payload: { "user_id": "uuid", "status": "online|offline", "last_seen": "ts" }

- "chat:unread_update"
  Payload: { "chat_id": "uuid", "unread_count": number }

--------------------------------------------------------------------------------
6. WEBRTC CALL EVENTS (Сигналинг звонков)
--------------------------------------------------------------------------------

- "call:initiate"
  Payload: { "target_id": "uuid", "type": "audio|video", "is_group": boolean }

- "call:request" (Сервер -> Получателю)
  Payload: { "caller_id": "uuid", "caller_name": "str", "call_id": "uuid" }

- "call:accept"
  Payload: { "call_id": "uuid" }

- "call:signal" (Обмен SDP и ICE)
  Payload: { "to": "uuid", "signal_data": { "type": "offer|answer|candidate", ... } }

- "call:end"
  Payload: { "call_id": "uuid", "reason": "busy|hangup|error" }

--------------------------------------------------------------------------------
7. MEDIA SERVICE (Загрузка файлов)
--------------------------------------------------------------------------------

7.1. POST /media/upload
Content-Type: multipart/form-data
Responses: 200 OK: { "file_id": "uuid", "url": "url", "thumb": "url" }

7.2. GET /media/download/:file_id
Описание: Получение файла с проверкой прав доступа к чату.
