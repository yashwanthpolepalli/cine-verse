"""
Seed Module
───────────
Seeds ONLY the Theatre rows and one default User on first boot.
All movies and showtimes come from the MovieGlu API via movieglu.py.

Theatre data is seeded once so the app has Indian theatre names to attach
API showtimes to. When using India (IN) credentials, the API's cinemasNearby
will also upsert real cinemas, so these seeds serve as a fallback / supplement.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Theatre, User


THEATRES_DATA = [
    # ── HYDERABAD ─────────────────────────────────────────────────────────────
    {"id": "hyd-prasads",      "name": "Prasads Multiplex",           "distance": "0.8 km",  "city": "Hyderabad",  "district": "Hyderabad",  "state": "Telangana"},
    {"id": "hyd-pvr-galleria", "name": "PVR Galleria Mall",            "distance": "3.4 km",  "city": "Hyderabad",  "district": "Hyderabad",  "state": "Telangana"},
    {"id": "hyd-amb",          "name": "AMB Cinemas",                  "distance": "5.1 km",  "city": "Hyderabad",  "district": "Hyderabad",  "state": "Telangana"},
    {"id": "hyd-cinepolis",    "name": "Cinepolis IMAX Nexus",         "distance": "6.3 km",  "city": "Hyderabad",  "district": "Hyderabad",  "state": "Telangana"},
    {"id": "hyd-inox-gvk",    "name": "INOX GVK One",                 "distance": "4.2 km",  "city": "Hyderabad",  "district": "Hyderabad",  "state": "Telangana"},
    {"id": "hyd-pvr-inorbit",  "name": "PVR Inorbit Mall",             "distance": "7.8 km",  "city": "Hyderabad",  "district": "Hyderabad",  "state": "Telangana"},
    {"id": "hyd-asian-luxe",   "name": "Asian Luxe Cinemas",           "distance": "9.2 km",  "city": "Hyderabad",  "district": "Hyderabad",  "state": "Telangana"},
    {"id": "hyd-miraj",        "name": "Miraj Cinemas Hi-Life Mall",   "distance": "10.5 km", "city": "Hyderabad",  "district": "Hyderabad",  "state": "Telangana"},
    {"id": "hyd-pvr-forum",    "name": "PVR Forum Sujana",             "distance": "12.0 km", "city": "Hyderabad",  "district": "Hyderabad",  "state": "Telangana"},
    {"id": "hyd-chitralaya",   "name": "Chitralaya Grand",             "distance": "2.1 km",  "city": "Hyderabad",  "district": "Hyderabad",  "state": "Telangana"},
    # ── SANGAREDDY district ───────────────────────────────────────────────────
    {"id": "sgr-cinepolis",    "name": "Cinepolis Sangareddy",         "distance": "1.2 km",  "city": "Sangareddy", "district": "Sangareddy", "state": "Telangana"},
    {"id": "sgr-miraj",        "name": "Miraj Cinemas Sangareddy",     "distance": "3.5 km",  "city": "Sangareddy", "district": "Sangareddy", "state": "Telangana"},
    {"id": "sgr-rc",           "name": "RC Cinemas",                   "distance": "0.9 km",  "city": "Sangareddy", "district": "Sangareddy", "state": "Telangana"},
    # ── SIDDIPET district ─────────────────────────────────────────────────────
    {"id": "sdp-swagath",      "name": "Swagath Theatre",              "distance": "0.6 km",  "city": "Siddipet",   "district": "Siddipet",   "state": "Telangana"},
    {"id": "sdp-sai",          "name": "Sai Baba Multiplex",           "distance": "2.1 km",  "city": "Siddipet",   "district": "Siddipet",   "state": "Telangana"},
    # ── WARANGAL ──────────────────────────────────────────────────────────────
    {"id": "wgl-pvr",          "name": "PVR Warangal",                 "distance": "1.5 km",  "city": "Warangal",   "district": "Warangal",   "state": "Telangana"},
    {"id": "wgl-inox",         "name": "INOX Forum Warangal",          "distance": "3.8 km",  "city": "Warangal",   "district": "Warangal",   "state": "Telangana"},
    {"id": "wgl-apsrtc",       "name": "APSRTC Complex Cinemas",       "distance": "0.7 km",  "city": "Warangal",   "district": "Warangal",   "state": "Telangana"},
    # ── KARIMNAGAR ────────────────────────────────────────────────────────────
    {"id": "knr-navya",        "name": "Navya Multiplex",              "distance": "1.0 km",  "city": "Karimnagar", "district": "Karimnagar", "state": "Telangana"},
    {"id": "knr-pvr",          "name": "PVR Karimnagar",               "distance": "4.5 km",  "city": "Karimnagar", "district": "Karimnagar", "state": "Telangana"},
    # ── NIZAMABAD ─────────────────────────────────────────────────────────────
    {"id": "nzb-geeta",        "name": "Geeta Theatre",                "distance": "0.5 km",  "city": "Nizamabad",  "district": "Nizamabad",  "state": "Telangana"},
    {"id": "nzb-bhavya",       "name": "Bhavya Cinema",                "distance": "2.0 km",  "city": "Nizamabad",  "district": "Nizamabad",  "state": "Telangana"},
    # ── KHAMMAM ───────────────────────────────────────────────────────────────
    {"id": "khm-sree",         "name": "Sree Durga Theatre",           "distance": "0.8 km",  "city": "Khammam",    "district": "Khammam",    "state": "Telangana"},
    # ── ANDHRA PRADESH ────────────────────────────────────────────────────────
    {"id": "vjw-pvr",          "name": "PVR Vijayawada",               "distance": "2.3 km",  "city": "Vijayawada", "district": "Krishna",    "state": "Andhra Pradesh"},
    {"id": "vjw-inox",         "name": "INOX Vijayawada",              "distance": "4.1 km",  "city": "Vijayawada", "district": "Krishna",    "state": "Andhra Pradesh"},
    {"id": "vsp-inox",         "name": "INOX Visakhapatnam",           "distance": "1.8 km",  "city": "Visakhapatnam","district": "Visakhapatnam","state": "Andhra Pradesh"},
    {"id": "vsp-pvr",          "name": "PVR CMR Central",              "distance": "3.2 km",  "city": "Visakhapatnam","district": "Visakhapatnam","state": "Andhra Pradesh"},
    # ── MUMBAI ────────────────────────────────────────────────────────────────
    {"id": "mum-pvr-icon",     "name": "PVR Icon",                     "distance": "1.5 km",  "city": "Mumbai",     "district": "Mumbai",     "state": "Maharashtra"},
    {"id": "mum-inox-metro",   "name": "INOX Metro Big",               "distance": "3.2 km",  "city": "Mumbai",     "district": "Mumbai",     "state": "Maharashtra"},
    {"id": "mum-cinepolis",    "name": "Cinepolis Andheri",            "distance": "4.8 km",  "city": "Mumbai",     "district": "Mumbai",     "state": "Maharashtra"},
    {"id": "mum-pvr-juhu",     "name": "PVR Juhu",                     "distance": "6.0 km",  "city": "Mumbai",     "district": "Mumbai",     "state": "Maharashtra"},
    {"id": "mum-regal",        "name": "Regal Cinema",                 "distance": "2.0 km",  "city": "Mumbai",     "district": "Mumbai",     "state": "Maharashtra"},
    # ── DELHI NCR ─────────────────────────────────────────────────────────────
    {"id": "del-pvr-select",   "name": "PVR Select City Walk",         "distance": "2.1 km",  "city": "Delhi (NCR)","district": "South Delhi","state": "Delhi"},
    {"id": "del-inox-cp",      "name": "INOX Connaught Place",         "distance": "3.5 km",  "city": "Delhi (NCR)","district": "Central Delhi","state": "Delhi"},
    {"id": "del-pvr-ambience", "name": "PVR Ambience Mall",            "distance": "5.0 km",  "city": "Delhi (NCR)","district": "Gurugram",   "state": "Haryana"},
    {"id": "del-cinepolis",    "name": "Cinepolis DLF",                "distance": "6.2 km",  "city": "Delhi (NCR)","district": "Gurugram",   "state": "Haryana"},
    # ── BENGALURU ─────────────────────────────────────────────────────────────
    {"id": "blr-pvr-forum",    "name": "PVR Forum Mall",               "distance": "1.8 km",  "city": "Bengaluru",  "district": "Bengaluru Urban","state": "Karnataka"},
    {"id": "blr-inox-garuda",  "name": "INOX Garuda Mall",             "distance": "2.9 km",  "city": "Bengaluru",  "district": "Bengaluru Urban","state": "Karnataka"},
    {"id": "blr-pvr-orion",    "name": "PVR Orion Mall",               "distance": "4.5 km",  "city": "Bengaluru",  "district": "Bengaluru Urban","state": "Karnataka"},
    {"id": "blr-cinepolis",    "name": "Cinepolis Nexus Shantiniketan","distance": "7.2 km",  "city": "Bengaluru",  "district": "Bengaluru Urban","state": "Karnataka"},
    {"id": "blr-rex",          "name": "Rex Theatre",                  "distance": "3.1 km",  "city": "Bengaluru",  "district": "Bengaluru Urban","state": "Karnataka"},
    # ── CHENNAI ───────────────────────────────────────────────────────────────
    {"id": "chn-sathyam",      "name": "Sathyam Cinemas",              "distance": "1.2 km",  "city": "Chennai",    "district": "Chennai",    "state": "Tamil Nadu"},
    {"id": "chn-pvr-vr",       "name": "PVR VR Mall",                  "distance": "5.1 km",  "city": "Chennai",    "district": "Chennai",    "state": "Tamil Nadu"},
    {"id": "chn-inox-ega",     "name": "INOX EGA",                     "distance": "3.0 km",  "city": "Chennai",    "district": "Chennai",    "state": "Tamil Nadu"},
    {"id": "chn-rohini",       "name": "Rohini Silver Screens",        "distance": "4.5 km",  "city": "Chennai",    "district": "Chennai",    "state": "Tamil Nadu"},
    {"id": "chn-pvr-phoenix",  "name": "PVR Phoenix MarketCity",       "distance": "8.0 km",  "city": "Chennai",    "district": "Chennai",    "state": "Tamil Nadu"},
    # ── KOLKATA ───────────────────────────────────────────────────────────────
    {"id": "kol-inox-quest",   "name": "INOX Quest Mall",              "distance": "2.3 km",  "city": "Kolkata",    "district": "Kolkata",    "state": "West Bengal"},
    {"id": "kol-pvr-acropolis","name": "PVR Acropolis Mall",           "distance": "4.7 km",  "city": "Kolkata",    "district": "Kolkata",    "state": "West Bengal"},
    {"id": "kol-star",         "name": "Star Theatre",                 "distance": "6.0 km",  "city": "Kolkata",    "district": "Kolkata",    "state": "West Bengal"},
    # ── PUNE ──────────────────────────────────────────────────────────────────
    {"id": "pun-esq",          "name": "E-Square Multiplex",           "distance": "1.9 km",  "city": "Pune",       "district": "Pune",       "state": "Maharashtra"},
    {"id": "pun-inox-west",    "name": "INOX Westend Mall",            "distance": "3.0 km",  "city": "Pune",       "district": "Pune",       "state": "Maharashtra"},
    {"id": "pun-pvr",          "name": "PVR Amanora",                  "distance": "5.5 km",  "city": "Pune",       "district": "Pune",       "state": "Maharashtra"},
    # ── AHMEDABAD ─────────────────────────────────────────────────────────────
    {"id": "ahm-pvr",          "name": "PVR Acropolis Mall",           "distance": "2.5 km",  "city": "Ahmedabad",  "district": "Ahmedabad",  "state": "Gujarat"},
    {"id": "ahm-cinepolis",    "name": "Cinepolis Ahmedabad",          "distance": "4.0 km",  "city": "Ahmedabad",  "district": "Ahmedabad",  "state": "Gujarat"},
    # ── KOCHI ─────────────────────────────────────────────────────────────────
    {"id": "kch-pvr",          "name": "PVR Oberon Mall",              "distance": "2.2 km",  "city": "Kochi",      "district": "Ernakulam",  "state": "Kerala"},
    {"id": "kch-inox",         "name": "INOX Lulu Mall",               "distance": "3.8 km",  "city": "Kochi",      "district": "Ernakulam",  "state": "Kerala"},
    {"id": "kch-pvr-centre",   "name": "PVR Centre Square",            "distance": "1.5 km",  "city": "Kochi",      "district": "Ernakulam",  "state": "Kerala"},
    # ── CHANDIGARH ────────────────────────────────────────────────────────────
    {"id": "chd-pvr",          "name": "PVR Centra Mall",              "distance": "2.0 km",  "city": "Chandigarh", "district": "Chandigarh", "state": "Punjab"},
    {"id": "chd-inox",         "name": "INOX Elante",                  "distance": "3.5 km",  "city": "Chandigarh", "district": "Chandigarh", "state": "Punjab"},
    # ── JAIPUR ────────────────────────────────────────────────────────────────
    {"id": "jai-pvr-mgf",      "name": "PVR MGF Metropolitan",         "distance": "3.0 km",  "city": "Jaipur",     "district": "Jaipur",     "state": "Rajasthan"},
    # ── LUCKNOW ───────────────────────────────────────────────────────────────
    {"id": "lko-pvr",          "name": "PVR Phoenix Palassio",         "distance": "2.8 km",  "city": "Lucknow",    "district": "Lucknow",    "state": "Uttar Pradesh"},
    # ── COIMBATORE ────────────────────────────────────────────────────────────
    {"id": "cbe-pvr",          "name": "PVR Coimbatore",               "distance": "2.0 km",  "city": "Coimbatore", "district": "Coimbatore", "state": "Tamil Nadu"},
    {"id": "cbe-inox",         "name": "INOX Brookefields",            "distance": "3.5 km",  "city": "Coimbatore", "district": "Coimbatore", "state": "Tamil Nadu"},
]


async def seed_database(session: AsyncSession):
    """
    Seeds Theatre rows and a default User on first boot.
    Movies and showtimes come from MovieGlu API automatically.
    """
    # Only seed if theatres table is empty
    result = await session.execute(select(Theatre).limit(1))
    if result.scalars().first() is not None:
        return

    print("🏛️  Seeding theatres and user...", flush=True)

    for t in THEATRES_DATA:
        name_lower = t["name"].lower()
        if any(m in name_lower for m in ["amb", "pvr", "cinepolis", "inox", "sathyam", "multiplex"]):
            rows, cols, price, fee = 10, 12, 350.0, 45.0
        elif any(l in name_lower for l in ["swagath", "sree", "geeta", "bhavya", "rex", "rohini", "apsrtc"]):
            rows, cols, price, fee = 6, 8, 150.0, 15.0
        else:
            rows, cols, price, fee = 8, 10, 250.0, 30.0

        theatre = Theatre(
            id           = t["id"],
            name         = t["name"],
            distance     = t["distance"],
            city         = t["city"],
            district     = t.get("district"),
            state        = t["state"],
            rows_count   = rows,
            cols_count   = cols,
            ticket_price = price,
            booking_fee  = fee,
        )
        session.add(theatre)

    # Default user
    user = User(
        name           = "Yash Kumar",
        email          = "yash@lumiere.app",
        avatar_initials = "YK",
        films_watched  = 0,
        hours          = 0,
        reviews        = 0,
    )
    session.add(user)

    await session.commit()
    print(f"✅  Seeded {len(THEATRES_DATA)} theatres.", flush=True)
