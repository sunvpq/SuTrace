# 💧 SuTrace — Интерактивная карта водных точек

Прототип для хакатона **Water Innovation Hackathon — Sustainable Groundwater Solutions**.

Карта скважин, колодцев и водовозов Атырауской и Мангистауской областей Казахстана.

---

## Быстрый старт (Docker)

```bash
# Одна команда — поднимает всё
docker-compose up --build
```

| Сервис      | URL                          |
|-------------|------------------------------|
| Frontend    | http://localhost:3000         |
| Backend API | http://localhost:8000/api    |
| API Docs    | http://localhost:8000/docs   |

---

## Локальная разработка (без Docker)

### Backend

```bash
cd backend

# PostgreSQL + PostGIS должен быть запущен
# Создайте БД:
# createdb sutrace && psql -d sutrace -c "CREATE EXTENSION postgis;"

pip install -r requirements.txt

# Заполнить тестовыми данными (38 точек)
python seed.py

# Запустить сервер
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## Структура проекта

```
sutrace/
├── backend/
│   ├── main.py          # FastAPI: все эндпоинты
│   ├── models.py        # SQLAlchemy + PostGIS модели
│   ├── database.py      # Подключение к PostgreSQL
│   ├── seed.py          # 38 реалистичных точек (Атырау + Мангистау)
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── MapPage.jsx       # Главная карта с кластеризацией
│           ├── Filters.jsx       # Фильтры по типу/статусу/качеству
│           ├── NearestButton.jsx # Ближайшая пресная вода
│           ├── AddPointForm.jsx  # Форма добавления точки
│           ├── Dashboard.jsx     # Дашборд акимата
│           └── Header.jsx        # Навигация (desktop + mobile)
└── docker-compose.yml
```

---

## API

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/api/points` | Список точек (фильтры: `type`, `status`, `water_quality`) |
| `GET` | `/api/points/{id}` | Одна точка |
| `POST` | `/api/points` | Добавить точку |
| `PUT` | `/api/points/{id}` | Обновить точку |
| `GET` | `/api/points/nearest?lat=&lon=&quality=fresh` | Ближайшая активная точка |
| `GET` | `/api/stats` | Статистика для дашборда |
| `GET` | `/api/stats/by-district` | Разбивка по районам |

---

## Цветовая легенда карты

| Цвет | Значение |
|------|----------|
| 🟢 Зелёный | Работает, пресная вода |
| 🟡 Жёлтый | Солёная / слабосолёная |
| 🔴 Красный | Сломана |
| 🔵 Синий | Водовоз |
| ⚫ Серый | Заброшена |

---

## Техстек

- **Frontend**: React 18, Vite, Tailwind CSS, Leaflet.js + MarkerCluster, Recharts
- **Backend**: Python FastAPI, SQLAlchemy, GeoAlchemy2
- **БД**: PostgreSQL 16 + PostGIS 3.4
- **Инфра**: Docker Compose

---

## Seed-данные

38 точек по реальным координатам:
- **Атырауская область**: Жылыойский, Макатский, Махамбетский, Исатайский, Курмангазинский районы + г. Атырау
- **Мангистауская область**: Каракиянский, Бейнеуский, Тупкараганский, Мунайлинский районы + г. Актау

Распределение: ~40% работающих, ~30% сломанных, ~30% заброшенных.
