from fastapi import FastAPI, HTTPException

from app.api.analysis import router as analysis_router
from app.api.briefs import router as briefs_router
from app.db.database import check_database_connection

app = FastAPI(title="BriefScope AI", version="0.1.0")

app.include_router(briefs_router)
app.include_router(analysis_router)


@app.get("/health")
def health():
    try:
        check_database_connection()
        return {"status": "ok", "database": "connected"}
    except Exception:
        raise HTTPException(status_code=503, detail="Database connection failed")