"""
Sync: Propagate subscription_tier from Clients to their Managers and Agents.
Fixes existing users created before the auto-inherit feature was implemented.
"""
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import text
from app.db.session import SessionLocal

def sync_tiers():
    db = SessionLocal()
    try:
        # Find all managers and agents that are 'trial' but whose creator is not 'trial'.
        rows = db.execute(text("""
            SELECT u.id, u.email, u.role, u.subscription_tier,
                   creator.subscription_tier AS creator_tier, creator.email AS creator_email
            FROM users u
            JOIN users creator ON creator.id = u.created_by_id
            WHERE u.role IN ('manager', 'agent')
              AND u.subscription_tier = 'trial'
              AND creator.subscription_tier IN ('pro', 'enterprise')
        """)).fetchall()

        if not rows:
            print("No users need tier sync. All tiers are up to date.")
            return

        print(f"Found {len(rows)} user(s) to sync:\n")
        for row in rows:
            print(f"  - {row.email} (role={row.role}): trial → {row.creator_tier} (creator: {row.creator_email})")
            db.execute(
                text("UPDATE users SET subscription_tier = :tier WHERE id = :uid"),
                {"tier": row.creator_tier, "uid": row.id}
            )

        db.commit()
        print(f"\n✅ {len(rows)} user(s) synced successfully.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    sync_tiers()
