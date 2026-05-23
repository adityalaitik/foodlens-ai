import httpx

from config.settings import settings


async def get_product_by_upc(upc: str, store_id: str) -> dict | None:
    if not settings.CATALOG_API_URL:
        return None
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{settings.CATALOG_API_URL}/products",
                params={"upc": upc, "store_id": store_id},
                headers={"Authorization": f"Bearer {settings.CATALOG_API_KEY}"},
            )
            if response.status_code == 200:
                data = response.json()
                return {
                    "name": data.get("name", ""),
                    "brand": data.get("brand", ""),
                    "description": data.get("description", ""),
                }
    except Exception:
        pass
    return None
