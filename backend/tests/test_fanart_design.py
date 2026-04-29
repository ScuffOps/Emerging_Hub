"""Backend tests for Phase 2B: Fan Art submissions + Design reorder."""
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
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------------- Fan Art ----------------
class TestFanartSubmit:
    def test_submit_requires_title(self, api):
        r = api.post(f"{BASE_URL}/api/fanart", json={"image_url": "https://x.test/a.png", "submitter_name": "TEST_sub"}, timeout=20)
        assert r.status_code == 400

    def test_submit_requires_image_url(self, api):
        r = api.post(f"{BASE_URL}/api/fanart", json={"title": "TEST_t", "submitter_name": "TEST_sub"}, timeout=20)
        assert r.status_code == 400

    def test_submit_requires_submitter_name(self, api):
        r = api.post(f"{BASE_URL}/api/fanart", json={"title": "TEST_t", "image_url": "https://x.test/a.png"}, timeout=20)
        assert r.status_code == 400

    def test_submit_public_creates_pending(self, api, auth_headers):
        payload = {
            "title": "TEST_FA_submit",
            "image_url": "https://example.com/a.png",
            "submitter_name": "TEST_Artist",
            "submitter_handle": "@test",
            "message": "Hi"
        }
        r = api.post(f"{BASE_URL}/api/fanart", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "submitted"
        fid = data["id"]
        # verify it shows up as pending via admin list
        g = api.get(f"{BASE_URL}/api/fanart?status=pending", headers=auth_headers, timeout=20)
        assert g.status_code == 200
        items = g.json()["items"]
        found = next((x for x in items if x["id"] == fid), None)
        assert found is not None
        assert found["status"] == "pending"
        assert found["title"] == "TEST_FA_submit"
        # cleanup
        api.delete(f"{BASE_URL}/api/fanart/{fid}", headers=auth_headers, timeout=20)


class TestFanartList:
    def test_public_list_defaults_approved_only(self, api, auth_headers):
        # seed a pending fanart and verify public cannot see it
        p = api.post(f"{BASE_URL}/api/fanart", json={"title": "TEST_FA_pubcheck", "image_url": "https://x/p.png", "submitter_name": "TEST"}, timeout=20)
        fid = p.json()["id"]
        try:
            r = api.get(f"{BASE_URL}/api/fanart", timeout=20)
            assert r.status_code == 200
            for it in r.json()["items"]:
                assert it["status"] == "approved"
                assert it["id"] != fid
        finally:
            api.delete(f"{BASE_URL}/api/fanart/{fid}", headers=auth_headers, timeout=20)

    def test_public_cannot_override_status(self, api, auth_headers):
        # seed pending, ensure public list with ?status=pending still returns only approved
        p = api.post(f"{BASE_URL}/api/fanart", json={"title": "TEST_FA_override", "image_url": "https://x/o.png", "submitter_name": "TEST"}, timeout=20)
        fid = p.json()["id"]
        try:
            r = api.get(f"{BASE_URL}/api/fanart?status=pending", timeout=20)
            assert r.status_code == 200
            for it in r.json()["items"]:
                assert it["status"] == "approved", f"Public leaked non-approved: {it}"
        finally:
            api.delete(f"{BASE_URL}/api/fanart/{fid}", headers=auth_headers, timeout=20)

    def test_admin_status_all(self, api, auth_headers):
        # create pending + approve a second one
        ids = []
        p1 = api.post(f"{BASE_URL}/api/fanart", json={"title": "TEST_FA_all1", "image_url": "https://x/1.png", "submitter_name": "TEST"}, timeout=20)
        ids.append(p1.json()["id"])
        p2 = api.post(f"{BASE_URL}/api/fanart", json={"title": "TEST_FA_all2", "image_url": "https://x/2.png", "submitter_name": "TEST"}, timeout=20)
        ids.append(p2.json()["id"])
        try:
            api.patch(f"{BASE_URL}/api/fanart/{ids[1]}", json={"status": "approved"}, headers=auth_headers, timeout=20)
            r = api.get(f"{BASE_URL}/api/fanart?status=all", headers=auth_headers, timeout=20)
            assert r.status_code == 200
            items = r.json()["items"]
            by_id = {i["id"]: i for i in items}
            assert ids[0] in by_id and by_id[ids[0]]["status"] == "pending"
            assert ids[1] in by_id and by_id[ids[1]]["status"] == "approved"
        finally:
            for i in ids:
                api.delete(f"{BASE_URL}/api/fanart/{i}", headers=auth_headers, timeout=20)


class TestFanartReview:
    def test_patch_requires_auth(self, api):
        r = api.patch(f"{BASE_URL}/api/fanart/anyid", json={"status": "approved"}, timeout=20)
        assert r.status_code == 401

    def test_patch_invalid_status(self, api, auth_headers):
        p = api.post(f"{BASE_URL}/api/fanart", json={"title": "TEST_FA_inv", "image_url": "https://x/i.png", "submitter_name": "TEST"}, timeout=20)
        fid = p.json()["id"]
        try:
            r = api.patch(f"{BASE_URL}/api/fanart/{fid}", json={"status": "bogus"}, headers=auth_headers, timeout=20)
            assert r.status_code == 400
        finally:
            api.delete(f"{BASE_URL}/api/fanart/{fid}", headers=auth_headers, timeout=20)

    def test_approve_reject_cycle(self, api, auth_headers):
        p = api.post(f"{BASE_URL}/api/fanart", json={"title": "TEST_FA_cycle", "image_url": "https://x/c.png", "submitter_name": "TEST"}, timeout=20)
        fid = p.json()["id"]
        try:
            # approve
            r = api.patch(f"{BASE_URL}/api/fanart/{fid}", json={"status": "approved"}, headers=auth_headers, timeout=20)
            assert r.status_code == 200 and r.json()["new_status"] == "approved"
            g = api.get(f"{BASE_URL}/api/fanart?status=approved", timeout=20)
            assert any(i["id"] == fid for i in g.json()["items"])
            # reject
            r = api.patch(f"{BASE_URL}/api/fanart/{fid}", json={"status": "rejected"}, headers=auth_headers, timeout=20)
            assert r.status_code == 200
            g = api.get(f"{BASE_URL}/api/fanart?status=rejected", headers=auth_headers, timeout=20)
            assert any(i["id"] == fid for i in g.json()["items"])
            # public should not see it
            g = api.get(f"{BASE_URL}/api/fanart", timeout=20)
            assert all(i["id"] != fid for i in g.json()["items"])
        finally:
            api.delete(f"{BASE_URL}/api/fanart/{fid}", headers=auth_headers, timeout=20)

    def test_patch_404_missing(self, api, auth_headers):
        r = api.patch(f"{BASE_URL}/api/fanart/nonexistent_xyz", json={"status": "approved"}, headers=auth_headers, timeout=20)
        assert r.status_code == 404


class TestFanartDelete:
    def test_delete_requires_auth(self, api):
        r = api.delete(f"{BASE_URL}/api/fanart/anyid", timeout=20)
        assert r.status_code == 401

    def test_soft_delete_removes_from_admin_list(self, api, auth_headers):
        p = api.post(f"{BASE_URL}/api/fanart", json={"title": "TEST_FA_del", "image_url": "https://x/d.png", "submitter_name": "TEST"}, timeout=20)
        fid = p.json()["id"]
        d = api.delete(f"{BASE_URL}/api/fanart/{fid}", headers=auth_headers, timeout=20)
        assert d.status_code == 200
        g = api.get(f"{BASE_URL}/api/fanart?status=all", headers=auth_headers, timeout=20)
        assert all(i["id"] != fid for i in g.json()["items"])


# ---------------- Design reorder ----------------
class TestDesignReorder:
    def test_reorder_requires_auth(self, api):
        r = api.put(f"{BASE_URL}/api/design/reorder", json={"ids": []}, timeout=20)
        assert r.status_code == 401

    def test_reorder_route_not_shadowed(self, api, auth_headers):
        """Ensure /design/reorder isn't captured by /design/{element_id} → 404."""
        r = api.put(f"{BASE_URL}/api/design/reorder", json={"ids": []}, headers=auth_headers, timeout=20)
        assert r.status_code == 200, f"got {r.status_code}: {r.text}"
        assert r.json()["updated"] == 0

    def test_reorder_updates_display_order(self, api, auth_headers):
        # Seed 3 elements
        seeds = []
        try:
            for i in range(3):
                r = api.post(
                    f"{BASE_URL}/api/design",
                    json={"name": f"TEST_el_{i}", "category": "feature", "display_order": i},
                    headers=auth_headers, timeout=20,
                )
                assert r.status_code == 200, r.text
                seeds.append(r.json()["id"])
            # Reverse order
            new_order = list(reversed(seeds))
            r = api.put(f"{BASE_URL}/api/design/reorder", json={"ids": new_order}, headers=auth_headers, timeout=20)
            assert r.status_code == 200 and r.json()["updated"] == 3
            # GET should return in new order (among our seeded ids)
            g = api.get(f"{BASE_URL}/api/design", timeout=20)
            assert g.status_code == 200
            elements = g.json()["elements"]
            ours = [e for e in elements if e["id"] in seeds]
            ours_sorted_by_returned_order = [e["id"] for e in ours]
            assert ours_sorted_by_returned_order == new_order, f"Expected {new_order}, got {ours_sorted_by_returned_order}"
            # display_order values assigned 0,1,2 in list order
            by_id = {e["id"]: e for e in ours}
            for idx, eid in enumerate(new_order):
                assert by_id[eid]["display_order"] == idx
        finally:
            for sid in seeds:
                api.delete(f"{BASE_URL}/api/design/{sid}", headers=auth_headers, timeout=20)

    def test_reorder_rejects_non_list(self, api, auth_headers):
        r = api.put(f"{BASE_URL}/api/design/reorder", json={"ids": "notalist"}, headers=auth_headers, timeout=20)
        assert r.status_code == 400


# ---------------- Regression smoke ----------------
class TestRegression:
    def test_credits_public(self, api):
        r = api.get(f"{BASE_URL}/api/credits", timeout=20)
        assert r.status_code == 200
        assert "artists" in r.json()

    def test_gallery_public_list(self, api):
        r = api.get(f"{BASE_URL}/api/gallery", timeout=20)
        assert r.status_code == 200

    def test_merch_public(self, api):
        r = api.get(f"{BASE_URL}/api/merch", timeout=30)
        assert r.status_code == 200
        # Should have products or error field
        data = r.json()
        assert "products" in data

    def test_debut_password_gate(self, api):
        r = api.get(f"{BASE_URL}/api/debut", timeout=20)
        assert r.status_code == 401
