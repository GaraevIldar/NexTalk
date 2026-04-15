# NexTalk — C4-модель для IcePanel

> Этот файл содержит описание C4-модели и JSON для импорта в [IcePanel](https://icepanel.io).
> Обзорные mermaid-диаграммы — в [README.md](README.md), раздел «Архитектура».

---

## Как импортировать в IcePanel

1. Зарегистрируйтесь на [app.icepanel.io](https://app.icepanel.io) (бесплатный план достаточен).
2. Создайте новый **Landscape** с названием `NexTalk`.
3. Откройте **Settings → Import** (или используйте [API](https://developer.icepanel.io/)).
4. Импортируйте JSON из раздела ниже через `POST /landscapes/{id}/versions/latest/import`.
5. После импорта: расположите объекты на диаграмме и создайте **Flows** для пользовательских сценариев.

> Если импорт через API неудобен — используйте описание ниже для ручного создания объектов в интерфейсе IcePanel.

---

## Структура модели

### C4 Level 1 — System Context

Кто взаимодействует с NexTalk:

| Тип | Объект | Описание |
|:--|:--|:--|
| Actor | Пользователь | Общается через браузер: текст, голос, DM |
| Actor | Админ платформы | Мониторинг, блокировка пользователей/серверов |
| System | **NexTalk** | Платформа командного общения с E2EE |
| System (external) | Coturn | TURN/STUN — помогает установить WebRTC через NAT |
| System (external) | Email-провайдер | SMTP — уведомления офлайн-пользователям |

Связи:
- Пользователь → NexTalk (HTTPS, WebSocket, WebRTC)
- Админ → NexTalk (HTTPS)
- NexTalk → Coturn (TURN/STUN)
- NexTalk → Email-провайдер (SMTP)

### C4 Level 2 — Container Diagram

Из чего состоит NexTalk (запускаемые компоненты):

| Тип | Объект | Технология | Описание |
|:--|:--|:--|:--|
| App | Vue.js SPA | Vue 3, TypeScript | UI, E2EE шифрование, WebSocket, WebRTC |
| App | .NET Монолит | .NET 10, ASP.NET Core | Вся бизнес-логика: Identity, Guild, Messaging, Voice |
| Store | PostgreSQL | PostgreSQL 16 | Пользователи, серверы, зашифрованные сообщения |
| Store | Redis | Redis 7 | Онлайн-статусы, кэш прав, rate limiting |
| Store | MinIO | MinIO | Зашифрованные вложения, аватары |
| App | mediasoup | Node.js, mediasoup | SFU — пересылка голосовых потоков |

Связи:
- Vue.js SPA → .NET Монолит (REST API / HTTPS)
- Vue.js SPA → .NET Монолит (WebSocket)
- Vue.js SPA → mediasoup (WebRTC)
- Vue.js SPA → Coturn (TURN/STUN)
- .NET Монолит → PostgreSQL (TCP/SQL)
- .NET Монолит → Redis (TCP)
- .NET Монолит → MinIO (HTTP/S3)
- .NET Монолит → mediasoup (HTTP API)

### C4 Level 3 — Component Diagram (.NET Монолит)

Внутренняя структура монолита:

| Тип | Объект | Описание |
|:--|:--|:--|
| Component | Identity Module | Регистрация, логин, JWT, профили, публичные E2EE-ключи |
| Component | Guild Module | Серверы, каналы, роли (RBAC), инвайты, модерация |
| Component | Messaging Module | Зашифрованные сообщения, DM, вложения, пагинация |
| Component | Voice Module | Голосовые сессии, WebRTC signaling |
| Component | WebSocket Layer | Управление WS-соединениями, broadcast, heartbeat, presence |
| Component | Background Services | Outbox Relay, Notification Service |

Связи внутри монолита:
- WebSocket Layer → Messaging Module (доставка сообщений)
- WebSocket Layer → Voice Module (signaling события)
- WebSocket Layer → Guild Module (online/offline уведомления)
- Messaging Module → Guild Module (проверка прав на канал)
- Voice Module → Guild Module (проверка прав на голос)
- Background Services → Messaging Module (чтение outbox)
- Background Services → Email-провайдер (SMTP)

---

## JSON для импорта в IcePanel

Скопируйте JSON ниже и используйте через [IcePanel Import API](https://developer.icepanel.io/):

```
POST /landscapes/{landscapeId}/versions/latest/import
Content-Type: application/json
Authorization: Bearer {api-key}
```

### Полный импорт (Level 1 + Level 2 + Level 3)

```json
{
  "namespace": "nextalk",
  "tagGroups": [
    {
      "id": "tg-layer",
      "name": "Layer",
      "icon": "layer-group"
    },
    {
      "id": "tg-tech",
      "name": "Technology",
      "icon": "microchip"
    }
  ],
  "tags": [
    { "id": "tag-frontend", "groupId": "tg-layer", "name": "Frontend", "color": "green" },
    { "id": "tag-backend", "groupId": "tg-layer", "name": "Backend", "color": "blue" },
    { "id": "tag-storage", "groupId": "tg-layer", "name": "Storage", "color": "orange" },
    { "id": "tag-media", "groupId": "tg-layer", "name": "Media", "color": "purple" },
    { "id": "tag-external", "groupId": "tg-layer", "name": "External", "color": "gray" },
    { "id": "tag-dotnet", "groupId": "tg-tech", "name": ".NET 10" },
    { "id": "tag-vue", "groupId": "tg-tech", "name": "Vue.js 3" },
    { "id": "tag-postgres", "groupId": "tg-tech", "name": "PostgreSQL" },
    { "id": "tag-redis", "groupId": "tg-tech", "name": "Redis" },
    { "id": "tag-nodejs", "groupId": "tg-tech", "name": "Node.js" }
  ],
  "modelObjects": [
    {
      "id": "domain-nextalk",
      "name": "NexTalk",
      "type": "domain",
      "description": "Платформа командного общения с end-to-end шифрованием"
    },

    {
      "id": "actor-user",
      "name": "Пользователь",
      "type": "actor",
      "parentId": "domain-nextalk",
      "description": "Общается через браузер: текст, голос, DM. Шифрование и расшифровка происходят на его устройстве.",
      "caption": "Браузер"
    },
    {
      "id": "actor-admin",
      "name": "Админ платформы",
      "type": "actor",
      "parentId": "domain-nextalk",
      "description": "Мониторинг работоспособности, блокировка пользователей и серверов.",
      "caption": "Технический специалист"
    },

    {
      "id": "system-nextalk",
      "name": "NexTalk Platform",
      "type": "system",
      "parentId": "domain-nextalk",
      "description": "Платформа для командного общения (текст, голос, DM) с end-to-end шифрованием. Сервер не имеет доступа к содержимому сообщений.",
      "caption": "Модульный монолит + SPA",
      "tagIds": ["tag-backend"]
    },
    {
      "id": "system-coturn",
      "name": "Coturn",
      "type": "system",
      "parentId": "domain-nextalk",
      "external": true,
      "description": "TURN/STUN сервер для обхода NAT. Без него голосовые каналы не работают у ~30% пользователей.",
      "caption": "TURN/STUN",
      "tagIds": ["tag-external", "tag-media"]
    },
    {
      "id": "system-email",
      "name": "Email-провайдер",
      "type": "system",
      "parentId": "domain-nextalk",
      "external": true,
      "description": "Внешний SMTP-сервис для отправки email-уведомлений офлайн-пользователям. Содержит только метаданные (кто, куда), без текста.",
      "caption": "SMTP",
      "tagIds": ["tag-external"]
    },

    {
      "id": "app-spa",
      "name": "Vue.js SPA",
      "type": "app",
      "parentId": "system-nextalk",
      "description": "Клиентское приложение в браузере. Отвечает за UI, E2EE шифрование/расшифровку (Web Crypto API), WebSocket-соединение и WebRTC для голоса.",
      "caption": "Vue 3 + TypeScript",
      "tagIds": ["tag-frontend", "tag-vue"]
    },
    {
      "id": "app-monolith",
      "name": ".NET Монолит",
      "type": "app",
      "parentId": "system-nextalk",
      "description": "Единый .NET 10 процесс со всеми бизнес-модулями: Identity, Guild, Messaging, Voice. Включает WebSocket-слой и фоновые сервисы.",
      "caption": ".NET 10 Modular Monolith",
      "tagIds": ["tag-backend", "tag-dotnet"]
    },
    {
      "id": "store-postgres",
      "name": "PostgreSQL",
      "type": "store",
      "parentId": "system-nextalk",
      "description": "Основное хранилище. 3 схемы: identity (пользователи, ключи), guild (серверы, каналы, роли), messaging (зашифрованные blob-ы, DM, outbox).",
      "caption": "PostgreSQL 16",
      "tagIds": ["tag-storage", "tag-postgres"]
    },
    {
      "id": "store-redis",
      "name": "Redis",
      "type": "store",
      "parentId": "system-nextalk",
      "description": "In-memory хранилище. Онлайн-статусы (heartbeat TTL 30с), кэш RBAC-прав, голосовые сессии, rate limiting.",
      "caption": "Redis 7",
      "tagIds": ["tag-storage", "tag-redis"]
    },
    {
      "id": "store-minio",
      "name": "MinIO",
      "type": "store",
      "parentId": "system-nextalk",
      "description": "S3-совместимое объектное хранилище. Хранит зашифрованные вложения и аватары. Клиент шифрует файл до загрузки.",
      "caption": "S3-compatible",
      "tagIds": ["tag-storage"]
    },
    {
      "id": "app-mediasoup",
      "name": "mediasoup",
      "type": "app",
      "parentId": "system-nextalk",
      "description": "SFU-медиасервер (Node.js). Пересылает зашифрованные голосовые потоки между участниками без раскодирования.",
      "caption": "Node.js — SFU",
      "tagIds": ["tag-media", "tag-nodejs"]
    },

    {
      "id": "comp-identity",
      "name": "Identity Module",
      "type": "component",
      "parentId": "app-monolith",
      "description": "Регистрация, логин, JWT-токены, профили пользователей, хранение публичных E2EE-ключей. Схема БД: identity.",
      "caption": "Аутентификация и ключи"
    },
    {
      "id": "comp-guild",
      "name": "Guild Module",
      "type": "component",
      "parentId": "app-monolith",
      "description": "Серверы, каналы, роли (RBAC bitmask), инвайт-ссылки, модерация (кик/бан). Схема БД: guild. Используется всеми другими модулями для проверки прав.",
      "caption": "Серверы, каналы, права"
    },
    {
      "id": "comp-messaging",
      "name": "Messaging Module",
      "type": "component",
      "parentId": "app-monolith",
      "description": "Приём и хранение зашифрованных сообщений (blob), DM, вложения, cursor-based пагинация, outbox. Схема БД: messaging.",
      "caption": "Сообщения и DM"
    },
    {
      "id": "comp-voice",
      "name": "Voice Module",
      "type": "component",
      "parentId": "app-monolith",
      "description": "Голосовые сессии: join/leave, WebRTC signaling (SDP, ICE). Общается с mediasoup по HTTP API.",
      "caption": "Голос и signaling"
    },
    {
      "id": "comp-websocket",
      "name": "WebSocket Layer",
      "type": "component",
      "parentId": "app-monolith",
      "description": "Управляет PostWebSocket-соединениями: авторизация при handshake, регистрация подключений, broadcast событий по каналам, heartbeat и presence.",
      "caption": "Real-time доставка"
    },
    {
      "id": "comp-background",
      "name": "Background Services",
      "type": "component",
      "parentId": "app-monolith",
      "description": "Outbox Relay: читает outbox_messages и публикует во внутреннюю очередь (System.Threading.Channels). Notification Service: отправляет email офлайн-пользователям.",
      "caption": "Outbox + Notifications"
    }
  ],
  "modelConnections": [
    {
      "id": "conn-user-spa",
      "name": "Использует",
      "originId": "actor-user",
      "targetId": "app-spa",
      "direction": "outgoing",
      "description": "Пользователь открывает SPA в браузере"
    },
    {
      "id": "conn-admin-monolith",
      "name": "Управляет",
      "originId": "actor-admin",
      "targetId": "app-monolith",
      "direction": "outgoing",
      "description": "Мониторинг, блокировка пользователей/серверов через HTTPS"
    },

    {
      "id": "conn-spa-monolith-rest",
      "name": "REST API",
      "originId": "app-spa",
      "targetId": "app-monolith",
      "direction": "outgoing",
      "description": "CRUD операции: авторизация, серверы, каналы, сообщения, настройки"
    },
    {
      "id": "conn-spa-monolith-ws",
      "name": "WebSocket",
      "originId": "app-spa",
      "targetId": "app-monolith",
      "direction": "bidirectional",
      "description": "Real-time: доставка сообщений, статусы, signaling, heartbeat"
    },
    {
      "id": "conn-spa-mediasoup",
      "name": "WebRTC",
      "originId": "app-spa",
      "targetId": "app-mediasoup",
      "direction": "bidirectional",
      "description": "Зашифрованные голосовые потоки"
    },
    {
      "id": "conn-spa-coturn",
      "name": "TURN/STUN",
      "originId": "app-spa",
      "targetId": "system-coturn",
      "direction": "outgoing",
      "description": "Обход NAT для установки WebRTC-соединения"
    },

    {
      "id": "conn-monolith-postgres",
      "name": "SQL",
      "originId": "app-monolith",
      "targetId": "store-postgres",
      "direction": "outgoing",
      "description": "Чтение/запись: пользователи, серверы, зашифрованные сообщения"
    },
    {
      "id": "conn-monolith-redis",
      "name": "TCP",
      "originId": "app-monolith",
      "targetId": "store-redis",
      "direction": "outgoing",
      "description": "Кэш прав, онлайн-статусы, голосовые сессии, rate limiting"
    },
    {
      "id": "conn-monolith-minio",
      "name": "S3 API",
      "originId": "app-monolith",
      "targetId": "store-minio",
      "direction": "outgoing",
      "description": "Загрузка/скачивание зашифрованных вложений и аватаров"
    },
    {
      "id": "conn-monolith-mediasoup",
      "name": "HTTP API",
      "originId": "app-monolith",
      "targetId": "app-mediasoup",
      "direction": "outgoing",
      "description": "Управление голосовыми комнатами: создание, удаление, участники"
    },
    {
      "id": "conn-monolith-email",
      "name": "SMTP",
      "originId": "app-monolith",
      "targetId": "system-email",
      "direction": "outgoing",
      "description": "Отправка email-уведомлений (только метаданные)"
    },

    {
      "id": "conn-ws-messaging",
      "name": "Доставка сообщений",
      "originId": "comp-websocket",
      "targetId": "comp-messaging",
      "direction": "bidirectional",
      "description": "WebSocket слой получает blob от Messaging и рассылает онлайн-участникам канала"
    },
    {
      "id": "conn-ws-voice",
      "name": "Signaling",
      "originId": "comp-websocket",
      "targetId": "comp-voice",
      "direction": "bidirectional",
      "description": "Передача SDP offer/answer и ICE-кандидатов между клиентом и Voice Module"
    },
    {
      "id": "conn-ws-guild",
      "name": "Presence",
      "originId": "comp-websocket",
      "targetId": "comp-guild",
      "direction": "outgoing",
      "description": "Уведомления о подключении/отключении пользователей"
    },
    {
      "id": "conn-messaging-guild",
      "name": "Проверка прав",
      "originId": "comp-messaging",
      "targetId": "comp-guild",
      "direction": "outgoing",
      "description": "Messaging проверяет: может ли пользователь писать в этот канал"
    },
    {
      "id": "conn-voice-guild",
      "name": "Проверка прав",
      "originId": "comp-voice",
      "targetId": "comp-guild",
      "direction": "outgoing",
      "description": "Voice проверяет: может ли пользователь подключиться к голосу"
    },
    {
      "id": "conn-bg-messaging",
      "name": "Outbox",
      "originId": "comp-background",
      "targetId": "comp-messaging",
      "direction": "outgoing",
      "description": "Outbox Relay читает таблицу outbox_messages"
    },
    {
      "id": "conn-voice-mediasoup",
      "name": "Room management",
      "originId": "comp-voice",
      "targetId": "app-mediasoup",
      "direction": "outgoing",
      "description": "Создание/удаление комнат, управление участниками"
    }
  ]
}
```

```yaml
# yaml-language-server: $schema=https://api.icepanel.io/v1/schemas/LandscapeImportData
namespace: nextalk
tagGroups:
- id: tg-layer
  name: Layer
  icon: globe
- id: tg-tech
  name: Technology
  icon: microchip
tags:
- id: tag-frontend
  groupId: tg-layer
  name: Frontend
  color: green
- id: tag-backend
  groupId: tg-layer
  name: Backend
  color: blue
- id: tag-storage
  groupId: tg-layer
  name: Storage
  color: orange
- id: tag-media
  groupId: tg-layer
  name: Media
  color: purple
- id: tag-external
  groupId: tg-layer
  name: External
  color: grey
- id: tag-dotnet
  groupId: tg-tech
  name: .NET 10
  color: blue
- id: tag-vue
  groupId: tg-tech
  name: Vue.js 3
  color: green
- id: tag-postgres
  groupId: tg-tech
  name: PostgreSQL
  color: orange
- id: tag-redis
  groupId: tg-tech
  name: Redis
  color: red
- id: tag-nodejs
  groupId: tg-tech
  name: Node.js
  color: beaver
modelObjects:
- id: domain-nextalk
  name: NexTalk
  type: domain
  description: Платформа командного общения с end-to-end шифрованием
- id: actor-user
  name: Пользователь
  type: actor
  parentId: domain-nextalk
  description: 'Общается через браузер: текст, голос, DM. Шифрование и расшифровка
    происходят на его устройстве.'
  caption: Браузер
- id: actor-admin
  name: Админ платформы
  type: actor
  parentId: domain-nextalk
  description: Мониторинг работоспособности, блокировка пользователей и серверов.
  caption: Технический специалист
- id: system-nextalk
  name: NexTalk Platform
  type: system
  parentId: domain-nextalk
  description: Платформа для командного общения (текст, голос, DM) с end-to-end шифрованием.
    Сервер не имеет доступа к содержимому сообщений.
  caption: Модульный монолит + SPA
  tagIds:
  - tag-backend
- id: system-coturn
  name: Coturn
  type: system
  parentId: domain-nextalk
  external: true
  description: TURN/STUN сервер для обхода NAT. Без него голосовые каналы не работают
    у ~30% пользователей.
  caption: TURN/STUN
  tagIds:
  - tag-external
  - tag-media
- id: system-email
  name: Email-провайдер
  type: system
  parentId: domain-nextalk
  external: true
  description: Внешний SMTP-сервис для отправки email-уведомлений офлайн-пользователям.
    Содержит только метаданные (кто, куда), без текста.
  caption: SMTP
  tagIds:
  - tag-external
- id: app-spa
  name: Vue.js SPA
  type: app
  parentId: system-nextalk
  description: Клиентское приложение в браузере. Отвечает за UI, E2EE шифрование/расшифровку
    (Web Crypto API), WebSocket-соединение и WebRTC для голоса.
  caption: Vue 3 + TypeScript
  tagIds:
  - tag-frontend
  - tag-vue
- id: app-monolith
  name: .NET Монолит
  type: app
  parentId: system-nextalk
  description: 'Единый .NET 10 процесс со всеми бизнес-модулями: Identity, Guild,
    Messaging, Voice. Включает WebSocket-слой и фоновые сервисы.'
  caption: .NET 10 Modular Monolith
  tagIds:
  - tag-backend
  - tag-dotnet
- id: store-postgres
  name: PostgreSQL
  type: store
  parentId: system-nextalk
  description: 'Основное хранилище. 3 схемы: identity (пользователи, ключи), guild
    (серверы, каналы, роли), messaging (зашифрованные blob-ы, DM, outbox).'
  caption: PostgreSQL 16
  tagIds:
  - tag-storage
  - tag-postgres
- id: store-redis
  name: Redis
  type: store
  parentId: system-nextalk
  description: In-memory хранилище. Онлайн-статусы (heartbeat TTL 30с), кэш RBAC-прав,
    голосовые сессии, rate limiting.
  caption: Redis 7
  tagIds:
  - tag-storage
  - tag-redis
- id: store-minio
  name: MinIO
  type: store
  parentId: system-nextalk
  description: S3-совместимое объектное хранилище. Хранит зашифрованные вложения и
    аватары. Клиент шифрует файл до загрузки.
  caption: S3-compatible
  tagIds:
  - tag-storage
- id: app-mediasoup
  name: mediasoup
  type: app
  parentId: system-nextalk
  description: SFU-медиасервер (Node.js). Пересылает зашифрованные голосовые потоки
    между участниками без раскодирования.
  caption: Node.js — SFU
  tagIds:
  - tag-media
  - tag-nodejs
  technologyIds:
  - lvUyvYYpLK6PQCoaAeKR
  icon:
    technologyId: lvUyvYYpLK6PQCoaAeKR
- id: comp-identity
  name: Identity Module
  type: component
  parentId: app-monolith
  description: 'Регистрация, логин, JWT-токены, профили пользователей, хранение публичных
    E2EE-ключей. Схема БД: identity.'
  caption: Аутентификация и ключи
- id: comp-guild
  name: Guild Module
  type: component
  parentId: app-monolith
  description: 'Серверы, каналы, роли (RBAC bitmask), инвайт-ссылки, модерация (кик/бан).
    Схема БД: guild. Используется всеми другими модулями для проверки прав.'
  caption: Серверы, каналы, права
- id: comp-messaging
  name: Messaging Module
  type: component
  parentId: app-monolith
  description: 'Приём и хранение зашифрованных сообщений (blob), DM, вложения, cursor-based
    пагинация, outbox. Схема БД: messaging.'
  caption: Сообщения и DM
- id: comp-voice
  name: Voice Module
  type: component
  parentId: app-monolith
  description: 'Голосовые сессии: join/leave, WebRTC signaling (SDP, ICE). Общается
    с mediasoup по HTTP API.'
  caption: Голос и signaling
- id: comp-websocket
  name: WebSocket Layer
  type: component
  parentId: app-monolith
  description: 'Управляет PostWebSocket-соединениями: авторизация при handshake, регистрация
    подключений, broadcast событий по каналам, heartbeat и presence.'
  caption: Real-time доставка
- id: comp-background
  name: Background Services
  type: component
  parentId: app-monolith
  description: 'Outbox Relay: читает outbox_messages и публикует во внутреннюю очередь
    (System.Threading.Channels). Notification Service: отправляет email офлайн-пользователям.'
  caption: Outbox + Notifications
modelConnections:
- id: conn-user-spa
  name: Использует
  originId: actor-user
  targetId: app-spa
  direction: outgoing
  description: Пользователь открывает SPA в браузере
- id: conn-admin-monolith
  name: Управляет
  originId: actor-admin
  targetId: app-monolith
  direction: outgoing
  description: Мониторинг, блокировка пользователей/серверов через HTTPS
- id: conn-spa-monolith-rest
  name: REST API
  originId: app-spa
  targetId: app-monolith
  direction: outgoing
  description: 'CRUD операции: авторизация, серверы, каналы, сообщения, настройки'
- id: conn-spa-monolith-ws
  name: WebSocket
  originId: app-spa
  targetId: app-monolith
  direction: bidirectional
  description: 'Real-time: доставка сообщений, статусы, signaling, heartbeat'
- id: conn-spa-mediasoup
  name: WebRTC
  originId: app-spa
  targetId: app-mediasoup
  direction: bidirectional
  description: Зашифрованные голосовые потоки
- id: conn-spa-coturn
  name: TURN/STUN
  originId: app-spa
  targetId: system-coturn
  direction: outgoing
  description: Обход NAT для установки WebRTC-соединения
- id: conn-monolith-postgres
  name: SQL
  originId: app-monolith
  targetId: store-postgres
  direction: outgoing
  description: 'Чтение/запись: пользователи, серверы, зашифрованные сообщения'
- id: conn-monolith-redis
  name: TCP
  originId: app-monolith
  targetId: store-redis
  direction: outgoing
  description: Кэш прав, онлайн-статусы, голосовые сессии, rate limiting
- id: conn-monolith-minio
  name: S3 API
  originId: app-monolith
  targetId: store-minio
  direction: outgoing
  description: Загрузка/скачивание зашифрованных вложений и аватаров
- id: conn-monolith-mediasoup
  name: HTTP API
  originId: app-monolith
  targetId: app-mediasoup
  direction: outgoing
  description: 'Управление голосовыми комнатами: создание, удаление, участники'
- id: conn-monolith-email
  name: SMTP
  originId: app-monolith
  targetId: system-email
  direction: outgoing
  description: Отправка email-уведомлений (только метаданные)
- id: conn-ws-messaging
  name: Доставка сообщений
  originId: comp-websocket
  targetId: comp-messaging
  direction: bidirectional
  description: WebSocket слой получает blob от Messaging и рассылает онлайн-участникам
    канала
- id: conn-ws-voice
  name: Signaling
  originId: comp-websocket
  targetId: comp-voice
  direction: bidirectional
  description: Передача SDP offer/answer и ICE-кандидатов между клиентом и Voice Module
- id: conn-ws-guild
  name: Presence
  originId: comp-websocket
  targetId: comp-guild
  direction: outgoing
  description: Уведомления о подключении/отключении пользователей
- id: conn-messaging-guild
  name: Проверка прав
  originId: comp-messaging
  targetId: comp-guild
  direction: outgoing
  description: 'Messaging проверяет: может ли пользователь писать в этот канал'
- id: conn-voice-guild
  name: Проверка прав
  originId: comp-voice
  targetId: comp-guild
  direction: outgoing
  description: 'Voice проверяет: может ли пользователь подключиться к голосу'
- id: conn-bg-messaging
  name: Outbox
  originId: comp-background
  targetId: comp-messaging
  direction: outgoing
  description: Outbox Relay читает таблицу outbox_messages
- id: conn-voice-mediasoup
  name: Room management
  originId: comp-voice
  targetId: app-mediasoup
  direction: outgoing
  description: Создание/удаление комнат, управление участниками

```

---

## Flows (создать вручную в IcePanel)

После импорта объектов и связей создайте следующие **Flows** в IcePanel для визуализации пользовательских сценариев:

### Flow 1: Регистрация и генерация ключей

```
1. Пользователь → Vue.js SPA: Открывает приложение
2. Vue.js SPA → .NET Монолит (REST): POST /api/auth/register
3. .NET Монолит → Identity Module: Создать аккаунт, хешировать пароль
4. Identity Module → PostgreSQL: INSERT в identity.users
5. Vue.js SPA: Генерация X25519 ключей (Web Crypto API)
6. Vue.js SPA → .NET Монолит (REST): PUT /api/users/me/keys (публичный ключ)
7. Identity Module → PostgreSQL: UPDATE identity.users (сохранить публичный ключ)
8. Vue.js SPA: Приватный ключ → IndexedDB (только в браузере)
```

### Flow 2: Отправка зашифрованного сообщения

```
1. Пользователь → Vue.js SPA: Ввод текста, нажатие «Отправить»
2. Vue.js SPA: Шифрование текста канальным ключом (AES-256-GCM) → blob
3. Vue.js SPA → .NET Монолит (REST): POST /api/channels/{id}/messages (blob)
4. .NET Монолит → Messaging Module: Проверить права через Guild Module
5. Messaging Module → Guild Module: Проверка прав (RBAC bitmask)
6. Guild Module → Redis: Кэш прав
7. Messaging Module → PostgreSQL: INSERT сообщение (blob) + запись в outbox
8. Background Services → Messaging Module: Outbox Relay читает outbox
9. WebSocket Layer: Рассылка blob всем онлайн-участникам канала
10. Vue.js SPA (получатель): Расшифровка blob канальным ключом → текст
```

### Flow 3: Голосовой канал

```
1. Пользователь → Vue.js SPA: Нажатие «Войти в голосовой канал»
2. Vue.js SPA → .NET Монолит (WebSocket): Запрос join
3. .NET Монолит → Voice Module: Проверить права через Guild Module
4. Voice Module → mediasoup (HTTP API): Создать комнату / добавить участника
5. Voice Module → Vue.js SPA (WebSocket): SDP offer + ICE candidates
6. Vue.js SPA → Coturn: STUN запрос (определить внешний IP)
7. Vue.js SPA → mediasoup (WebRTC): Установить аудио-поток
8. mediasoup: Пересылка зашифрованных пакетов остальным участникам
```

### Flow 4: Кик/бан с ротацией ключей

```
1. Админ → Vue.js SPA: Нажатие «Забанить» у участника
2. Vue.js SPA → .NET Монолит (REST): POST /api/guilds/{id}/bans
3. Guild Module: Записать бан, проверить права
4. WebSocket Layer: Принудительное отключение забаненного
5. Voice Module: Удалить из голосового канала
6. WebSocket Layer → Оставшиеся участники: Событие «участник забанен»
7. Vue.js SPA (любой участник): Генерировать новый канальный ключ
8. Vue.js SPA → .NET Монолит (REST): Отправить ключ, зашифрованный для каждого оставшегося
```

---

## Что означают типы объектов в IcePanel

| IcePanel тип | C4 эквивалент | В нашей модели |
|:--|:--|:--|
| `domain` | — (группировка) | NexTalk (корневой домен) |
| `actor` | Person | Пользователь, Админ платформы |
| `system` | Software System | NexTalk Platform, Coturn, Email-провайдер |
| `app` | Container | Vue.js SPA, .NET Монолит, mediasoup |
| `store` | Container (database) | PostgreSQL, Redis, MinIO |
| `component` | Component | Identity, Guild, Messaging, Voice, WebSocket, Background |
