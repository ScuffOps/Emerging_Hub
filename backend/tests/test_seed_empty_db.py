"""Tests specifically for the review request: /api/_diag/seed must succeed
on an empty DB (previously threw ValidationError on Lore fields).
Also verifies GET /api/character returns 404 when empty (so SeedBanner surfaces)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
DEBUT_PASSWORD = "veri2024"


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/auth/verify-debut", json={"password": DEBUT_PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


def _wipe_characters():
    import pymongo
    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.environ.get("DB_NAME", "test_database")
    c = pymongo.MongoClient(mongo_url)
    c[db_name].characters.delete_many({})
    c.close()


class TestSeedOnEmptyDB:
    def test_empty_db_flow(self, auth_headers):
        # 1) Wipe characters
        _wipe_characters()

        # 2) GET /api/character should now 404
        r = requests.get(f"{BASE_URL}/api/character", timeout=15)
        assert r.status_code == 404, f"Expected 404 for empty DB, got {r.status_code}: {r.text}"

        # 3) POST /api/_diag/seed as admin — must succeed (no ValidationError on Lore)
        s = requests.post(f"{BASE_URL}/api/_diag/seed", headers=auth_headers, timeout=30)
        assert s.status_code == 200, f"Seed failed: {s.status_code} {s.text}"
        data = s.json()
        assert data.get("ok") is True
        assert isinstance(data.get("actions"), list)
        # Character should have been created (not "already exists")
        assert any("character: created" in a or "character: replaced" in a for a in data["actions"]), (
            f"Expected character creation action, got: {data['actions']}"
        )

        # 4) GET /api/character should now return 200 with seeded data (name=Veri)
        r2 = requests.get(f"{BASE_URL}/api/character", timeout=15)
        assert r2.status_code == 200
        char = r2.json()
        assert char["name"] == "Veri"
        assert char["tagline"] == "Digital Kitsune Spirit"
        # Verify Lore fields (the bug) actually persisted
        assert "lore" in char and char["lore"] is not None
        assert char["lore"].get("backstory")
        assert char["lore"].get("currentGoal")

        # 5) Second seed call should be idempotent (character already exists, skipped)
        s2 = requests.post(f"{BASE_URL}/api/_diag/seed", headers=auth_headers, timeout=30)
        assert s2.status_code == 200
        assert any("already exists" in a for a in s2.json()["actions"])
