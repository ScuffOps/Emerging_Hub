"""Backend tests for Commissions module."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://avatar-showcase-5.preview.emergentagent.com").rstrip("/")
DEBUT_PASSWORD = "veri2024"


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def token(api):
    r = api.post(f"{BASE_URL}/api/auth/verify-debut", json={"password": DEBUT_PASSWORD}, timeout=20)
    assert r.status_code == 200, f"Auth failed: {r.status_code} {r.text}"
    t = r.json().get("token")
    assert t
    return t


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------- Auth ----------
def test_auth_invalid_password(api):
    r = api.post(f"{BASE_URL}/api/auth/verify-debut", json={"password": "wrong"}, timeout=20)
    assert r.status_code == 401


def test_auth_valid(token):
    assert isinstance(token, str) and len(token) > 10


# ---------- Visibility gating ----------
def test_list_public_only_without_token(api):
    r = api.get(f"{BASE_URL}/api/commissions", timeout=30)
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    for it in items:
        assert it.get("visibility") == "public", f"Non-public leaked: {it}"


def test_list_with_token_returns_all(api, auth_headers):
    # seed one admin commission so there is something not public
    payload = {"title": "TEST_admin_only", "platform": "Other", "type": "Other", "visibility": "admin", "budget": 10}
    cr = api.post(f"{BASE_URL}/api/commissions", json=payload, headers=auth_headers, timeout=30)
    assert cr.status_code == 200, cr.text
    cid = cr.json()["id"]
    try:
        r = api.get(f"{BASE_URL}/api/commissions", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        vis_set = {i.get("visibility") for i in r.json()}
        assert "admin" in vis_set
    finally:
        api.delete(f"{BASE_URL}/api/commissions/{cid}", headers=auth_headers, timeout=20)


# ---------- Auth requirements for write ----------
def test_post_requires_auth(api):
    r = api.post(f"{BASE_URL}/api/commissions", json={"title": "TEST_no_auth"}, timeout=20)
    assert r.status_code == 401


def test_put_requires_auth(api):
    r = api.put(f"{BASE_URL}/api/commissions/anyid", json={"title": "x"}, timeout=20)
    assert r.status_code == 401


def test_delete_requires_auth(api):
    r = api.delete(f"{BASE_URL}/api/commissions/anyid", timeout=20)
    assert r.status_code == 401


# ---------- CRUD + payment_status derivation ----------
def test_create_default_unpaid_when_no_payments(api, auth_headers):
    payload = {"title": "TEST_unpaid", "budget": 100, "platform": "Skeb", "type": "Icon"}
    r = api.post(f"{BASE_URL}/api/commissions", json=payload, headers=auth_headers, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["payment_status"] == "unpaid"
    cid = data["id"]
    # verify GET
    g = api.get(f"{BASE_URL}/api/commissions", headers=auth_headers, timeout=20)
    found = next((x for x in g.json() if x["id"] == cid), None)
    assert found and found["title"] == "TEST_unpaid"
    api.delete(f"{BASE_URL}/api/commissions/{cid}", headers=auth_headers, timeout=20)


def test_create_partial(api, auth_headers):
    payload = {"title": "TEST_partial", "budget": 200, "payments": [{"amount": 50}], "platform": "VGen", "type": "Bust"}
    r = api.post(f"{BASE_URL}/api/commissions", json=payload, headers=auth_headers, timeout=30)
    assert r.status_code == 200
    assert r.json()["payment_status"] == "partial"
    api.delete(f"{BASE_URL}/api/commissions/{r.json()['id']}", headers=auth_headers, timeout=20)


def test_create_paid(api, auth_headers):
    payload = {"title": "TEST_paid", "budget": 100, "payments": [{"amount": 60}, {"amount": 50}], "platform": "DA", "type": "CG"}
    r = api.post(f"{BASE_URL}/api/commissions", json=payload, headers=auth_headers, timeout=30)
    assert r.status_code == 200
    assert r.json()["payment_status"] == "paid"
    api.delete(f"{BASE_URL}/api/commissions/{r.json()['id']}", headers=auth_headers, timeout=20)


def test_create_explicit_payment_status_preserved(api, auth_headers):
    payload = {"title": "TEST_explicit", "budget": 100, "payment_status": "paid"}
    r = api.post(f"{BASE_URL}/api/commissions", json=payload, headers=auth_headers, timeout=30)
    assert r.status_code == 200
    assert r.json()["payment_status"] == "paid"
    api.delete(f"{BASE_URL}/api/commissions/{r.json()['id']}", headers=auth_headers, timeout=20)


def test_update_and_persistence(api, auth_headers):
    cr = api.post(f"{BASE_URL}/api/commissions", json={"title": "TEST_upd", "budget": 50}, headers=auth_headers, timeout=20)
    cid = cr.json()["id"]
    upd = {"title": "TEST_upd2", "budget": 80, "status": "Accepted", "platform": "Skeb", "type": "Icon"}
    r = api.put(f"{BASE_URL}/api/commissions/{cid}", json=upd, headers=auth_headers, timeout=20)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["title"] == "TEST_upd2"
    assert body["status"] == "Accepted"
    # verify persisted
    g = api.get(f"{BASE_URL}/api/commissions", headers=auth_headers, timeout=20)
    found = next((x for x in g.json() if x["id"] == cid), None)
    assert found and found["title"] == "TEST_upd2" and found["budget"] == 80
    api.delete(f"{BASE_URL}/api/commissions/{cid}", headers=auth_headers, timeout=20)


def test_delete_soft(api, auth_headers):
    cr = api.post(f"{BASE_URL}/api/commissions", json={"title": "TEST_del"}, headers=auth_headers, timeout=20)
    cid = cr.json()["id"]
    d = api.delete(f"{BASE_URL}/api/commissions/{cid}", headers=auth_headers, timeout=20)
    assert d.status_code == 200
    g = api.get(f"{BASE_URL}/api/commissions", headers=auth_headers, timeout=20)
    assert all(x["id"] != cid for x in g.json())


def test_update_404_for_missing(api, auth_headers):
    r = api.put(f"{BASE_URL}/api/commissions/nonexistent_id_xyz", json={"title": "x"}, headers=auth_headers, timeout=20)
    assert r.status_code == 404


# ---------- Filters ----------
def test_filters_full(api, auth_headers):
    seed_ids = []
    seeds = [
        {"title": "TEST_f1", "platform": "Skeb", "type": "Icon", "status": "Requested", "usage_rights": "personal",
         "budget": 50, "deadline": "2026-02-01", "artist": {"name": "AlphaArt"}, "visibility": "public"},
        {"title": "TEST_f2", "platform": "VGen", "type": "Bust", "status": "Accepted", "usage_rights": "streaming",
         "budget": 250, "deadline": "2026-04-01", "artist": {"name": "BetaArt"}, "visibility": "admin"},
        {"title": "TEST_f3", "platform": "Skeb", "type": "Icon", "status": "Completed", "usage_rights": "personal",
         "budget": 500, "deadline": "2026-06-01", "artist": {"name": "AlphaArt"}, "visibility": "public"},
    ]
    try:
        for s in seeds:
            r = api.post(f"{BASE_URL}/api/commissions", json=s, headers=auth_headers, timeout=20)
            assert r.status_code == 200, r.text
            seed_ids.append(r.json()["id"])

        # status filter
        r = api.get(f"{BASE_URL}/api/commissions?status=Completed", headers=auth_headers, timeout=20)
        ids = {i["id"] for i in r.json()}
        assert seed_ids[2] in ids and seed_ids[0] not in ids

        # platform filter
        r = api.get(f"{BASE_URL}/api/commissions?platform=Skeb", headers=auth_headers, timeout=20)
        ids = {i["id"] for i in r.json()}
        assert seed_ids[0] in ids and seed_ids[2] in ids and seed_ids[1] not in ids

        # type filter
        r = api.get(f"{BASE_URL}/api/commissions?type=Bust", headers=auth_headers, timeout=20)
        ids = {i["id"] for i in r.json()}
        assert seed_ids[1] in ids

        # artist regex case-insensitive
        r = api.get(f"{BASE_URL}/api/commissions?artist=alphaart", headers=auth_headers, timeout=20)
        ids = {i["id"] for i in r.json()}
        assert seed_ids[0] in ids and seed_ids[2] in ids and seed_ids[1] not in ids

        # usage_rights
        r = api.get(f"{BASE_URL}/api/commissions?usage_rights=streaming", headers=auth_headers, timeout=20)
        ids = {i["id"] for i in r.json()}
        assert seed_ids[1] in ids

        # price range
        r = api.get(f"{BASE_URL}/api/commissions?price_min=100&price_max=300", headers=auth_headers, timeout=20)
        ids = {i["id"] for i in r.json()}
        assert seed_ids[1] in ids and seed_ids[0] not in ids and seed_ids[2] not in ids

        # date range (deadline)
        r = api.get(f"{BASE_URL}/api/commissions?date_from=2026-03-01&date_to=2026-05-01", headers=auth_headers, timeout=20)
        ids = {i["id"] for i in r.json()}
        assert seed_ids[1] in ids and seed_ids[0] not in ids

        # visibility admin-only
        r = api.get(f"{BASE_URL}/api/commissions?visibility=admin", headers=auth_headers, timeout=20)
        for it in r.json():
            assert it["visibility"] == "admin"
    finally:
        for cid in seed_ids:
            api.delete(f"{BASE_URL}/api/commissions/{cid}", headers=auth_headers, timeout=20)


# ---------- Stats ----------
def test_stats_public_scope(api):
    r = api.get(f"{BASE_URL}/api/commissions/stats", timeout=20)
    assert r.status_code == 200
    data = r.json()
    for k in ("count", "total_budget", "total_paid", "total_outstanding", "by_status"):
        assert k in data, f"missing field {k}"
    assert isinstance(data["by_status"], dict)


def test_stats_admin_scope(api, auth_headers):
    r = api.get(f"{BASE_URL}/api/commissions/stats", headers=auth_headers, timeout=20)
    assert r.status_code == 200
    data = r.json()
    assert data["count"] >= 0
