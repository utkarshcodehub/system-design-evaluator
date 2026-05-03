from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import evaluate, sessions, generate
import uvicorn

app = FastAPI(title="System Design Evaluator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(evaluate.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")
app.include_router(generate.router, prefix="/api")

@app.get("/")
def root():
    return {"status": "ok", "service": "system-design-evaluator"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)