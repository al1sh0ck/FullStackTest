To-Do List с авторизацией (FastAPI + Next.js + Mantine)
О проекте
Полноценное To-Do приложение с регистрацией, входом по JWT, созданием/редактированием/удалением задач, фильтрацией и пагинацией.
Бэкенд — FastAPI + SQLite, фронтенд — Next.js + Mantine.
Структура проекта
/ (корень)
├── backend/    # FastAPI — API, авторизация, задачи
├── frontend/   # Next.js — UI и взаимодействие с API
└── README.md   # описание проекта
Как запустить
Backend
Перейди в папку backend

Установи зависимости (pip install -r requirements.txt)

Запусти сервер (uvicorn main:app --reload)

API будет доступен по адресу: http://localhost:8000

Frontend
Перейди в папку frontend

Установи зависимости (npm install)

Запусти клиентскую часть (npm run dev)

Приложение будет доступно по адресу: http://localhost:3000

Примеры API
Регистрация
POST /api/auth/signup
Тело запроса:
{
  "username": "user1",
  "password": "password123"
}
Авторизация
POST /api/auth/login
Тело запроса:

json
Copy
Edit
{
  "username": "user1",
  "password": "password123"
}
Ответ:
{
  "access_token": "<JWT_TOKEN>",
  "token_type": "bearer"
}
Получение задач
GET /api/tasks?page=1&limit=10
Заголовок: Authorization: Bearer <JWT_TOKEN>

Возможности

Аутентификация через JWT
CRUD задачи с привязкой к пользователю
Пагинация и фильтрация задач по статусу
Кнопка выхода (logout)
Настроены CORS и защита API
Поддержка Docker (если добавишь)

Контакты
Если есть вопросы — пиши!
Telegram: @al1sh0ck
Email: dev1ant_b@vk.com

