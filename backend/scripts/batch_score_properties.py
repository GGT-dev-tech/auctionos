#!/usr/bin/env python3
"""
batch_score_properties.py

Calcula e persiste o deal score de TODAS as propriedades no banco de dados,
replicando a lógica do scoringEngine.ts em Python puro.

Uso:
    # Dentro do container docker:
    docker compose exec backend python scripts/batch_score_properties.py

    # Com banco remoto:
    docker compose exec -e DATABASE_URL='postgresql://...' backend \
        python scripts/batch_score_properties.py

    # Apenas recalcular as que estão abaixo de um score mínimo:
    docker compose exec backend python scripts/batch_score_properties.py --min-score 0

    # Forçar recalcular TODAS (mesmo as que já têm score):
    docker compose exec backend python scripts/batch_score_properties.py --force

Opções:
    --force        Recalcula todas, sobrepondo scores existentes
    --batch-size   Tamanho do lote por commit (default: 500)
    --dry-run      Só calcula e exibe sem salvar
    --min-score    Só salva propriedades com score >= N
"""

import sys
import os
import json
import argparse
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Garante que o diretório raiz do backend esteja no path
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text

# ---------------------------------------------------------------------------
# Database URL
# ---------------------------------------------------------------------------
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@db:5432/auctionos"
)

# ---------------------------------------------------------------------------
# Scoring Engine (Python port do scoringEngine.ts)
# ---------------------------------------------------------------------------
MODEL_VERSION = "rule-based-v2"

def calculate_deal_score(row: dict) -> dict:
    """
    Replica do scoringEngine.ts com melhorias adicionais.
    Retorna { score: int, rating: str, factors: list[str] }
    """
    score = 0
    factors = []

    # ------------------------------------------------------------------
    # 1. DATA COMPLETENESS (max 30 pts)
    # ------------------------------------------------------------------
    address = (row.get("address") or "").strip()
    if address:
        score += 10
        factors.append("+10: Verified Address")

    property_type = (row.get("property_type") or "").strip().lower()
    if property_type and property_type not in ("", "unknown"):
        score += 10
        factors.append("+10: Known Property Type")

    owner_address = (row.get("owner_address") or "").strip()
    if owner_address:
        score += 10
        factors.append("+10: Owner Data Available")

    # ------------------------------------------------------------------
    # 2. FINANCIAL VIABILITY (max 50 pts)
    # ------------------------------------------------------------------
    amount_due  = float(row.get("amount_due")  or 0)
    assessed    = float(row.get("assessed_value") or 0)
    improvement = float(row.get("improvement_value") or 0)
    land_value  = float(row.get("land_value") or 0)

    if assessed > 0:
        tax_ratio = amount_due / assessed
        if tax_ratio < 0.05:
            score += 45
            factors.append("+45: Exceptional Tax-to-Value Ratio (<5%)")
        elif tax_ratio < 0.10:
            score += 35
            factors.append("+35: Excellent Tax-to-Value Ratio (<10%)")
        elif tax_ratio < 0.25:
            score += 22
            factors.append("+22: Good Tax-to-Value Ratio (<25%)")
        elif tax_ratio < 0.50:
            score += 10
            factors.append("+10: Fair Tax-to-Value Ratio (<50%)")
        else:
            factors.append("+0: High Tax-to-Value Ratio (>50%) — risk")
    else:
        factors.append("+0: Assessed Value Unknown")

    if improvement > 0:
        score += 5
        factors.append("+5: Has Improvements (structure present)")

    # ------------------------------------------------------------------
    # 3. PROPERTY CATEGORY BONUS (max 10 pts)
    # ------------------------------------------------------------------
    category = (row.get("property_category") or "").strip()
    if category == "Lien":
        score += 8
        factors.append("+8: Tax Lien — lower risk category")
    elif category == "Deed":
        score += 6
        factors.append("+6: Tax Deed — direct ownership pathway")
    elif category == "Foreclosure":
        score += 4
        factors.append("+4: Foreclosure — potential distressed deal")
    elif category in ("Cert", "Quit Claim"):
        score += 2
        factors.append(f"+2: {category} category")

    # ------------------------------------------------------------------
    # 4. LOT SIZE BONUS (max 5 pts)
    # ------------------------------------------------------------------
    lot_acres = float(row.get("lot_acres") or 0)
    if lot_acres >= 1.0:
        score += 5
        factors.append(f"+5: Significant Lot Size ({lot_acres:.2f} acres)")
    elif lot_acres >= 0.25:
        score += 2
        factors.append(f"+2: Moderate Lot Size ({lot_acres:.2f} acres)")

    # ------------------------------------------------------------------
    # 5. AVAILABILITY BONUS (5 pts se disponível)
    # ------------------------------------------------------------------
    availability = (row.get("availability_status") or "").strip().lower()
    if availability == "available":
        score += 5
        factors.append("+5: Confirmed Available")
    elif availability == "unavailable":
        score -= 5
        factors.append("-5: Currently Unavailable")

    # ------------------------------------------------------------------
    # Cap at 100
    # ------------------------------------------------------------------
    score = max(0, min(100, score))

    # ------------------------------------------------------------------
    # Grading curve calibrada com os novos critérios
    # ------------------------------------------------------------------
    if score >= 90:
        rating = "A+"
    elif score >= 78:
        rating = "A"
    elif score >= 63:
        rating = "B"
    elif score >= 48:
        rating = "C"
    elif score >= 33:
        rating = "D"
    else:
        rating = "F"

    return {"score": score, "rating": rating, "factors": factors}


# ---------------------------------------------------------------------------
# Progress Bar simples (sem dependência de tqdm)
# ---------------------------------------------------------------------------
def print_progress(current: int, total: int, prefix: str = "", suffix: str = "", bar_len: int = 40):
    filled = int(bar_len * current / total) if total > 0 else 0
    bar = "█" * filled + "░" * (bar_len - filled)
    pct = current / total * 100 if total > 0 else 0
    print(f"\r{prefix} [{bar}] {pct:5.1f}% ({current:,}/{total:,}) {suffix}", end="", flush=True)
    if current >= total:
        print()  # newline ao finalizar


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Batch score all properties")
    parser.add_argument("--force",      action="store_true", help="Recalculate even existing scores")
    parser.add_argument("--batch-size", type=int, default=500, help="Rows per commit batch")
    parser.add_argument("--dry-run",    action="store_true", help="Calculate scores without saving")
    parser.add_argument("--min-score",  type=float, default=None, help="Only save if score >= N")
    args = parser.parse_args()

    print("=" * 65)
    print("  AuctionOS — Batch Property Score Engine")
    print(f"  Model Version : {MODEL_VERSION}")
    print(f"  Batch Size    : {args.batch_size:,}")
    print(f"  Force Recalc  : {args.force}")
    print(f"  Dry Run       : {args.dry_run}")
    print(f"  Min Score     : {args.min_score if args.min_score is not None else 'None (save all)'}")
    print("=" * 65)

    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

    with engine.connect() as conn:
        # ------------------------------------------------------------------
        # 1. Count total rows
        # ------------------------------------------------------------------
        count_sql = text("SELECT COUNT(*) FROM property_details")
        total_properties = conn.execute(count_sql).scalar() or 0
        print(f"\n📦 Total properties in DB: {total_properties:,}")

        # Count already scored
        scored_sql = text("SELECT COUNT(*) FROM property_scores")
        already_scored = conn.execute(scored_sql).scalar() or 0
        print(f"⭐ Already scored       : {already_scored:,}")

        if args.force:
            to_process = total_properties
            print(f"🔄 Mode: FORCE — will recalculate all {to_process:,} properties")
        else:
            to_process = total_properties - already_scored
            print(f"➕ New to score         : {to_process:,}")

        if to_process == 0 and not args.force:
            print("\n✅ All properties already scored! Use --force to recalculate.")
            return

        # ------------------------------------------------------------------
        # 2. Fetch properties (in batches with offset/limit to avoid memory overflow)
        # ------------------------------------------------------------------
        print(f"\n🚀 Starting batch processing...\n")

        stats = {
            "A+": 0, "A": 0, "B": 0, "C": 0, "D": 0, "F": 0,
            "saved": 0, "skipped": 0, "errors": 0
        }

        offset = 0
        batch_size = args.batch_size
        processed = 0
        started_at = datetime.now()

        fetch_sql = text("""
            SELECT
                p.parcel_id,
                p.address,
                p.county,
                p.state,
                p.amount_due,
                p.assessed_value,
                p.improvement_value,
                p.land_value,
                p.lot_acres,
                p.property_type,
                p.property_category,
                p.availability_status,
                p.owner_address,
                p.occupancy
            FROM property_details p
            ORDER BY p.parcel_id
            LIMIT :limit OFFSET :offset
        """) if args.force else text("""
            SELECT
                p.parcel_id,
                p.address,
                p.county,
                p.state,
                p.amount_due,
                p.assessed_value,
                p.improvement_value,
                p.land_value,
                p.lot_acres,
                p.property_type,
                p.property_category,
                p.availability_status,
                p.owner_address,
                p.occupancy
            FROM property_details p
            LEFT JOIN property_scores ps ON ps.parcel_id = p.parcel_id
            WHERE ps.parcel_id IS NULL
            ORDER BY p.parcel_id
            LIMIT :limit OFFSET :offset
        """)

        upsert_sql = text("""
            INSERT INTO property_scores
                (parcel_id, deal_score, rating, status, state, county,
                 score_factors, model_version, computed_at, updated_at)
            VALUES
                (:parcel_id, :deal_score, :rating, :status, :state, :county,
                 :score_factors, :model_version, :computed_at, :updated_at)
            ON CONFLICT (parcel_id) DO UPDATE SET
                deal_score    = EXCLUDED.deal_score,
                rating        = EXCLUDED.rating,
                status        = EXCLUDED.status,
                state         = EXCLUDED.state,
                county        = EXCLUDED.county,
                score_factors = EXCLUDED.score_factors,
                model_version = EXCLUDED.model_version,
                updated_at    = EXCLUDED.updated_at
        """)

        while True:
            rows = conn.execute(fetch_sql, {"limit": batch_size, "offset": offset}).fetchall()
            if not rows:
                break

            batch_params = []
            for row in rows:
                row_dict = {
                    "parcel_id":         row[0],
                    "address":           row[1],
                    "county":            row[2],
                    "state":             row[3],
                    "amount_due":        row[4],
                    "assessed_value":    row[5],
                    "improvement_value": row[6],
                    "land_value":        row[7],
                    "lot_acres":         row[8],
                    "property_type":     row[9],
                    "property_category": row[10],
                    "availability_status": row[11],
                    "owner_address":     row[12],
                    "occupancy":         row[13],
                }

                try:
                    result = calculate_deal_score(row_dict)
                except Exception as e:
                    stats["errors"] += 1
                    continue

                s = result["score"]
                r = result["rating"]
                stats[r] = stats.get(r, 0) + 1

                if args.min_score is not None and s < args.min_score:
                    stats["skipped"] += 1
                    continue

                now = datetime.now(timezone.utc)
                batch_params.append({
                    "parcel_id":    row_dict["parcel_id"],
                    "deal_score":   float(s),
                    "rating":       r,
                    "status":       row_dict.get("availability_status"),
                    "state":        row_dict.get("state"),
                    "county":       row_dict.get("county"),
                    "score_factors": json.dumps(result["factors"]),
                    "model_version": MODEL_VERSION,
                    "computed_at":  now,
                    "updated_at":   now,
                })
                stats["saved"] += 1

            # Commit batch
            if batch_params and not args.dry_run:
                try:
                    conn.execute(upsert_sql, batch_params)
                    conn.commit()
                except Exception as e:
                    print(f"\n⚠️  Batch commit error at offset {offset}: {e}")
                    conn.rollback()
                    stats["errors"] += len(batch_params)

            processed += len(rows)

            # Elapsed and ETA
            elapsed = (datetime.now() - started_at).total_seconds()
            rate = processed / elapsed if elapsed > 0 else 1
            remaining = (to_process - processed) / rate if rate > 0 else 0
            eta = f"ETA ~{int(remaining)}s" if remaining > 0 else "done"

            print_progress(
                processed, to_process,
                prefix="Progress",
                suffix=f"| {rate:.0f}/s | {eta}"
            )

            offset += batch_size
            if len(rows) < batch_size:
                break  # last batch

        # ------------------------------------------------------------------
        # 3. Final Summary
        # ------------------------------------------------------------------
        total_elapsed = (datetime.now() - started_at).total_seconds()
        print(f"\n{'=' * 65}")
        print(f"  ✅ Batch scoring complete!")
        print(f"  ⏱  Time elapsed : {total_elapsed:.1f}s")
        print(f"  💾 Saved        : {stats['saved']:,} scores")
        print(f"  ⏭  Skipped      : {stats['skipped']:,} (below min_score)")
        print(f"  ❌ Errors       : {stats['errors']:,}")
        print(f"\n  Grade Distribution:")
        grade_total = sum(stats.get(g, 0) for g in ["A+", "A", "B", "C", "D", "F"])
        for grade in ["A+", "A", "B", "C", "D", "F"]:
            count = stats.get(grade, 0)
            pct = count / grade_total * 100 if grade_total > 0 else 0
            bar = "█" * int(pct / 2)
            print(f"    {grade:>2}  {bar:<50} {count:>7,}  ({pct:.1f}%)")
        print("=" * 65)
        if args.dry_run:
            print("  ⚠️  DRY RUN — nothing was saved to the database.")


if __name__ == "__main__":
    main()
