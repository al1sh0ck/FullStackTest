from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette.middleware.cors import CORSMiddleware
import crud
import schemas
import auth
from database import SessionLocal, engine
from models import Base
from typing import List
from database import init_db

# Создаем таблицы при старте приложения
init_db()

Base.metadata.create_all(bind=engine)

app = FastAPI()

class UserLogin(BaseModel):
    email: str
    password: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/auth/sign-up", response_model=schemas.Token)
def sign_up(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    created_user = crud.create_user(db=db, user=user)
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/sign-in", response_model=schemas.Token)
async def sign_in(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/tasks/", response_model=List[schemas.Task])
async def read_tasks(
    skip: int = 0,
    limit: int = 100,
    current_user: schemas.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    tasks = crud.get_tasks_by_user(db, user_id=current_user.id, skip=skip, limit=limit)
    return tasks

@app.post("/api/tasks/", response_model=schemas.Task)
def create_task(
    task: schemas.TaskCreate,
    current_user: schemas.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return crud.create_user_task(db=db, task=task, user_id=current_user.id)

@app.patch("/api/tasks/{task_id}", response_model=schemas.Task)
def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    current_user: schemas.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    task = crud.update_task_status(
        db,
        task_id=task_id,
        user_id=current_user.id,
        completed=task_update.completed
    )
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.delete("/api/tasks/{task_id}")
def delete_task(
    task_id: int,
    current_user: schemas.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    success = crud.delete_task(db, task_id=task_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}