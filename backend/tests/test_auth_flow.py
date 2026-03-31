import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_register_login_forgot_reset_flow():
    async with AsyncClient(app=app, base_url='http://test') as ac:
        # create tenant
        res = await ac.post('/api/public/tenants', json={
            'name': 'demo2',
            'admin_email': 'admin2@example.com',
            'admin_password': 'secretpass'
        })
        assert res.status_code == 201
        slug = res.json()['slug']

        # register a new user under tenant
        res = await ac.post('/api/auth/register', headers={'X-Tenant-Slug': slug}, json={'email': 'user@example.com', 'password': 'pass123', 'name': 'User One'})
        assert res.status_code == 201

        # login and ensure cookie is set
        res = await ac.post('/api/auth/login', headers={'X-Tenant-Slug': slug}, json={'email': 'user@example.com', 'password': 'pass123'})
        assert res.status_code == 200
        assert 'session' in res.cookies

        # forgot password -> get token from response (dev behavior)
        res = await ac.post('/api/auth/forgot-password', headers={'X-Tenant-Slug': slug}, json={'email': 'user@example.com'})
        assert res.status_code == 200
        data = res.json()
        assert data.get('ok') is True
        token = data.get('token')
        assert token

        # reset password
        res = await ac.post('/api/auth/reset-password', headers={'X-Tenant-Slug': slug}, json={'token': token, 'new_password': 'newpass'})
        assert res.status_code == 200
        assert res.json().get('ok') is True

        # login with new password
        res = await ac.post('/api/auth/login', headers={'X-Tenant-Slug': slug}, json={'email': 'user@example.com', 'password': 'newpass'})
        assert res.status_code == 200
        assert 'access_token' in res.json()
