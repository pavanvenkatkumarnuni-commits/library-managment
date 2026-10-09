from __future__ import annotations

import json
import os
import sqlite3
from contextlib import closing
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DATA_DIR = Path(os.getenv("LIBRARYHUB_DATA_DIR", Path(__file__).resolve().parent))
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = Path(os.getenv("LIBRARYHUB_DB_PATH", DATA_DIR / "libraryhub.sqlite3"))

def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    with closing(connect()) as db:
        db.execute("""CREATE TABLE IF NOT EXISTS records (
            kind TEXT NOT NULL, id TEXT NOT NULL, payload TEXT NOT NULL,
            updated_at TEXT NOT NULL, PRIMARY KEY(kind, id)
        )""")
        db.execute("""CREATE TABLE IF NOT EXISTS activity (
            id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL,
            action TEXT NOT NULL, detail TEXT NOT NULL
        )""")
        db.commit()

app = FastAPI(title="LibraryHub API", version="1.0.0", description="College library catalogue, members, lending and reports API")
origins = [x.strip() for x in os.getenv("CORS_ORIGINS", "*").split(",") if x.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=False, allow_methods=["*"], allow_headers=["*"])
init_db()

class Record(BaseModel):
    id: str = Field(min_length=1, max_length=120)
    data: dict[str, Any]

class StatePayload(BaseModel):
    books: list[dict[str, Any]] = []
    members: list[dict[str, Any]] = []

def log(db: sqlite3.Connection, action: str, detail: str) -> None:
    db.execute("INSERT INTO activity(at, action, detail) VALUES (?, ?, ?)", (datetime.utcnow().isoformat() + "Z", action, detail))

def all_records(kind: str) -> list[dict[str, Any]]:
    with closing(connect()) as db:
        rows = db.execute("SELECT payload FROM records WHERE kind=? ORDER BY updated_at DESC", (kind,)).fetchall()
        return [json.loads(row["payload"]) for row in rows]

@app.get("/")
def root() -> dict[str, str]:
    return {"name": "LibraryHub API", "docs": "/docs", "health": "/health"}

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "LibraryHub API"}

@app.get("/api/state")
def get_state() -> dict[str, Any]:
    with closing(connect()) as db:
        books = [json.loads(r["payload"]) for r in db.execute("SELECT payload FROM records WHERE kind='book' ORDER BY updated_at DESC")]
        members = [json.loads(r["payload"]) for r in db.execute("SELECT payload FROM records WHERE kind='member' ORDER BY updated_at DESC")]
        activity = [dict(r) for r in db.execute("SELECT id, at, action, detail FROM activity ORDER BY id DESC LIMIT 100")]
    return {"books": books, "members": members, "activity": activity}

@app.put("/api/state")
def replace_state(payload: StatePayload) -> dict[str, Any]:
    with closing(connect()) as db:
        try:
            db.execute("BEGIN")
            db.execute("DELETE FROM records")
            now = datetime.utcnow().isoformat() + "Z"
            for kind, rows in (("book", payload.books), ("member", payload.members)):
                for row in rows:
                    rid = str(row.get("id", "")).strip()
                    if not rid:
                        raise HTTPException(status_code=422, detail=f"{kind} record is missing id")
                    db.execute("INSERT INTO records(kind,id,payload,updated_at) VALUES(?,?,?,?)",
                               (kind, rid, json.dumps(row, ensure_ascii=False), now))
            log(db, "state_sync", f"Synced {len(payload.books)} books and {len(payload.members)} members")
            db.commit()
        except Exception:
            db.rollback()
            raise
    return {"saved": True, "books": len(payload.books), "members": len(payload.members)}

@app.get("/api/books")
def books() -> list[dict[str, Any]]:
    return all_records("book")

@app.post("/api/books", status_code=201)
def create_book(record: Record) -> dict[str, Any]:
    with closing(connect()) as db:
        try:
            db.execute("INSERT INTO records(kind,id,payload,updated_at) VALUES('book',?,?,?)",
                       (record.id, json.dumps(record.data, ensure_ascii=False), datetime.utcnow().isoformat() + "Z"))
            log(db, "book_created", str(record.data.get("title", record.id)))
            db.commit()
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=409, detail="Book id already exists")
    return record.data

@app.get("/api/members")
def members() -> list[dict[str, Any]]:
    return all_records("member")

@app.get("/api/reports/summary")
def report_summary() -> dict[str, Any]:
    books_data, members_data = all_records("book"), all_records("member")
    issued = [b for b in books_data if b.get("status") == "Issued"]
    today = date.today().isoformat()
    overdue = [b for b in issued if b.get("dueDate") and b["dueDate"] < today]
    return {"totalBooks": len(books_data), "availableBooks": sum(b.get("status") != "Issued" for b in books_data),
            "issuedBooks": len(issued), "overdueBooks": len(overdue), "totalMembers": len(members_data),
            "overdueTitles": [{"id": b.get("id"), "title": b.get("title"), "dueDate": b.get("dueDate")} for b in overdue]}

@app.get("/api/activity")
def activity() -> list[dict[str, Any]]:
    with closing(connect()) as db:
        return [dict(r) for r in db.execute("SELECT id, at, action, detail FROM activity ORDER BY id DESC LIMIT 100")]

@app.get("/api/notifications")
def notifications() -> dict[str, Any]:
    summary = report_summary()
    return {"count": summary["overdueBooks"], "items": summary["overdueTitles"]}

@app.post("/api/loans/issue")
def issue_book(book_id: str, member_id: str, days: int = 14) -> dict[str, Any]:
    with closing(connect()) as db:
        row = db.execute("SELECT payload FROM records WHERE kind='book' AND id=?", (book_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Book not found")
        book = json.loads(row["payload"])
        if book.get("status") == "Issued":
            raise HTTPException(status_code=409, detail="Book is already issued")
        if not db.execute("SELECT 1 FROM records WHERE kind='member' AND id=?", (member_id,)).fetchone():
            raise HTTPException(status_code=404, detail="Member not found")
        book.update(status="Issued", memberId=member_id, dueDate=(date.today() + timedelta(days=max(1, min(days, 90)))).isoformat())
        db.execute("UPDATE records SET payload=?, updated_at=? WHERE kind='book' AND id=?",
                   (json.dumps(book, ensure_ascii=False), datetime.utcnow().isoformat() + "Z", book_id))
        log(db, "book_issued", f"{book.get('title', book_id)} → {member_id}")
        db.commit()
        return book

@app.post("/api/loans/return/{book_id}")
def return_book(book_id: str) -> dict[str, Any]:
    with closing(connect()) as db:
        row = db.execute("SELECT payload FROM records WHERE kind='book' AND id=?", (book_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Book not found")
        book = json.loads(row["payload"])
        book.update(status="Available", memberId="", dueDate="")
        db.execute("UPDATE records SET payload=?, updated_at=? WHERE kind='book' AND id=?",
                   (json.dumps(book, ensure_ascii=False), datetime.utcnow().isoformat() + "Z", book_id))
        log(db, "book_returned", str(book.get("title", book_id)))
        db.commit()
    return book
