from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from typing import Generator

# Настройки SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

# Создаем движок с оптимальными настройками для SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # Важно для SQLite
    pool_size=10,  # Размер пула соединений
    max_overflow=20,  # Максимальное количество соединений
    echo=False,  # Логирование SQL (включить для отладки)
    future=True  # Используем новые возможности SQLAlchemy 2.0
)

# Настройка сессии
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False  # Для более удобной работы с объектами после коммита
)

Base = declarative_base()

def get_db() -> Generator:
    """
    Генератор сессий для Dependency Injection в FastAPI.
    Автоматически закрывает сессию после использования.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Инициализация БД (создание таблиц)
    """
    Base.metadata.create_all(bind=engine)