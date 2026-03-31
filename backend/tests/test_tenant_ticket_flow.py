import pytest
from httpx import AsyncClient
from app.main import app

# Integration test (requires Postgres + migrations applied). Marked as integration.

@pytest.mark.asyncio
async def test_tenant_and_ticket_flow():
    from fastapi.testclient import TestClient
    from httpx import ASGITransport
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as ac:
        # Create tenant
        res = await ac.post('/api/public/tenants', json={
            'name': 'demo',
            'admin_email': 'admin@example.com',
            'admin_password': 'secretpass'
        })
        assert res.status_code == 201
        data = res.json()
        assert 'slug' in data
        slug = data['slug']

        # Resolve current tenant
        res = await ac.get('/api/tenants/current', headers={'X-Tenant-Slug': slug})
        assert res.status_code == 200
        assert res.json().get('slug') == slug

        # Create a ticket
        res = await ac.post('/api/tickets', headers={'X-Tenant-Slug': slug}, json={'title': 'Test ticket', 'description': 'desc'})
        assert res.status_code == 201
        ticket = res.json()
        assert ticket['title'] == 'Test ticket'
