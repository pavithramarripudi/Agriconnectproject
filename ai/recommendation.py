"""
AgriConnect Price Discovery & Buyer Recommendation Module
Provides explainable rule-based price recommendations for farmers.
"""

def get_crop_recommendation(conn, crop_name, farmer_location=None):
    cursor = conn.cursor()

    # 1. Fetch available Mandi/Market prices for this crop
    cursor.execute("""
        SELECT market_name, location, min_price, max_price, modal_price, price_date
        FROM market_prices
        WHERE LOWER(crop_name) = LOWER(?)
        ORDER BY modal_price DESC
    """, (crop_name,))
    market_rows = cursor.fetchall()

    # 2. Fetch active buyer offers for this crop
    cursor.execute("""
        SELECT o.id, o.offer_price, u.name as buyer_name, u.location as buyer_location, l.quantity, l.unit
        FROM offers o
        JOIN crop_listings l ON o.listing_id = l.id
        JOIN users u ON o.buyer_id = u.id
        WHERE LOWER(l.crop_name) = LOWER(?) AND o.status = 'pending'
        ORDER BY o.offer_price DESC
    """, (crop_name,))
    buyer_offer_rows = cursor.fetchall()

    recommendations = []
    best_market = None
    best_offer = None

    if market_rows:
        top_market = market_rows[0]
        # top_market is (market_name, location, min_price, max_price, modal_price, price_date)
        best_market = {
            "type": "market",
            "title": top_market[0],
            "location": top_market[1],
            "modal_price": top_market[4],
            "price_range": f"₹{top_market[2]} - ₹{top_market[3]}",
            "unit": "Quintal (100 kg)",
            "reason": f"Highest available market/mandi price for {crop_name} in current dataset."
        }

    if buyer_offer_rows:
        top_offer = buyer_offer_rows[0]
        # top_offer is (id, offer_price, buyer_name, buyer_location, quantity, unit)
        # convert offer_price per kg to per quintal for direct comparison if needed, or express in listing unit
        offer_unit = top_offer[5] or "kg"
        best_offer = {
            "type": "buyer_offer",
            "offer_id": top_offer[0],
            "title": f"Direct Buyer: {top_offer[2]}",
            "location": top_offer[3],
            "price": top_offer[1],
            "unit": f"₹/{offer_unit}",
            "quantity": top_offer[4],
            "reason": f"Direct buyer offer currently available from {top_offer[2]} in {top_offer[3]}."
        }

    # Determine overall top recommendation
    top_recommendation = None
    if best_market and best_offer:
        # Convert market modal price (per quintal) to per kg: modal_price / 100
        mandi_price_per_kg = best_market["modal_price"] / 100.0
        offer_price_per_kg = best_offer["price"] if best_offer["unit"] == "₹/kg" else best_offer["price"]

        if offer_price_per_kg >= mandi_price_per_kg:
            top_recommendation = {
                "name": best_offer["title"],
                "price": f"₹{best_offer['price']}/{best_offer['unit'].replace('₹/', '')}",
                "location": best_offer["location"],
                "reason": f"Direct buyer offer (₹{best_offer['price']}/kg) exceeds top Mandi price (₹{best_market['modal_price']}/qtl ~ ₹{mandi_price_per_kg:.2f}/kg)."
            }
        else:
            top_recommendation = {
                "name": best_market["title"],
                "price": f"₹{best_market['modal_price']} / quintal",
                "location": best_market["location"],
                "reason": f"Highest market rate available for {crop_name} across mandis in current dataset."
            }
    elif best_market:
        top_recommendation = {
            "name": best_market["title"],
            "price": f"₹{best_market['modal_price']} / quintal",
            "location": best_market["location"],
            "reason": f"Highest market rate available for {crop_name} across mandis in current dataset."
        }
    elif best_offer:
        top_recommendation = {
            "name": best_offer["title"],
            "price": f"₹{best_offer['price']}/{best_offer['unit'].replace('₹/', '')}",
            "location": best_offer["location"],
            "reason": f"Direct buyer offer available from {best_offer['title']}."
        }

    return {
        "crop_name": crop_name,
        "best_recommendation": top_recommendation,
        "market_prices": [
            {
                "market_name": m[0],
                "location": m[1],
                "min_price": m[2],
                "max_price": m[3],
                "modal_price": m[4],
                "price_date": m[5]
            } for m in market_rows
        ],
        "buyer_offers": [
            {
                "id": o[0],
                "offer_price": o[1],
                "buyer_name": o[2],
                "buyer_location": o[3],
                "quantity": o[4],
                "unit": o[5]
            } for o in buyer_offer_rows
        ]
    }
