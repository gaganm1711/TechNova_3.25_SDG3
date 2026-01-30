import httpx
import asyncio

async def send_test():
    url = "http://127.0.0.1:8000/emergency"
    payload = {
        "name": "Test Patient",
        "age": 42,
        "emergencyType": "cardiac",
        "location": {"lat": 12.34, "lng": 56.78}
    }
    async with httpx.AsyncClient() as client:
        r = await client.post(url, json=payload, timeout=10)
        print(r.status_code, r.text)

if __name__ == '__main__':
    asyncio.run(send_test())
