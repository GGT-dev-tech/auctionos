import { Property } from '../types';
import { estimateARV } from './arvEstimator';
import { calculateDealScore } from './scoringEngine';

export interface RankedAuction {
    name: string;
    parcels_count: number;
    average_score?: number;
    total_arv?: number;
    normalizedScore: number;
}

/**
 * Placeholder logic for ranking entire auctions based on their aggregates.
 * When an ML model is introduced, this will ingest predicted yields and probability of clear title.
 */
export const rankAuctions = (auctions: any[]): RankedAuction[] => {
    // Currently, our simplistic backend just returns { name, parcels_count }
    // As a placeholder, we calculate a "Normalized Score" sorting primarily
    // by parcel count, weighting slightly toward more recent/upcoming sales if dates exist.
    
    return auctions.map(a => {
        // Base score off volume initially.
        let score = a.parcels_count;

        // In a real scenario, we'd average the `calculateDealScore` for all properties
        // inside `a`, but since we only have aggregate counts here:
        
        return {
            name: a.name || a.auction_name || a.auction_type || 'Unknown Auction',
            parcels_count: a.parcels_count,
            normalizedScore: score
        };
    }).sort((a, b) => b.normalizedScore - a.normalizedScore);
};

/**
 * Recommends specific properties from a list based on Deal Score.
 */
export const recommendProperties = (properties: Property[], limit: number = 5): Property[] => {
    // 1. Try strictly available properties first
    let candidates = properties.filter(p => {
        const status = (p.availability_status || p.details?.availability_status || '').toLowerCase().trim();
        // If status is blank, we assume it's possibly available but we prefer confirmed 'available'
        return status === 'available';
    });

    // 2. Fallback: If no available properties, use the full list (show the best deals the system has)
    // This prevents a broken/empty dashboard experience.
    if (candidates.length === 0 && properties.length > 0) {
        candidates = properties;
    }

    // Map with scores
    const scored = candidates.map(p => ({
        property: p,
        scoreResult: calculateDealScore(p)
    }));

    // Sort by Score DESC, then by Assessed Value DESC if tied
    scored.sort((a, b) => {
        if (b.scoreResult.score !== a.scoreResult.score) {
            return b.scoreResult.score - a.scoreResult.score;
        }
        return (b.property.assessed_value || 0) - (a.property.assessed_value || 0);
    });

    return scored.slice(0, limit).map(s => s.property);
};
