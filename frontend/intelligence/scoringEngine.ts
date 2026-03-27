import { Property } from '../types';

export interface DealScoreResult {
    score: number; // 0-100
    rating: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
    factors: string[];
}

/**
 * Lightweight rule-based scoring engine for Deal Quality.
 * Acts as a placeholder for future ML-based predictive modeling.
 */
export const calculateDealScore = (property: Property): DealScoreResult => {
    let score = 0;
    const factors: string[] = [];

    // 1. Data Completeness (30 points)
    if (property.address) {
        score += 10;
        factors.push('+10: Verified Address');
    }
    if (property.property_type && property.property_type.toLowerCase() !== 'unknown') {
        score += 10;
        factors.push('+10: Known Property Type');
    }
    if (property.owner_address) {
        score += 10;
        factors.push('+10: Owner Data Available');
    }

    // 2. Financial Viability (50 points)
    const taxes = property.amount_due || 0;
    const assessed = property.assessed_value || 0;

    if (assessed > 0) {
        const taxRatio = taxes / assessed;
        if (taxRatio < 0.1) {
            score += 40;
            factors.push('+40: Excellent Tax-to-Value Ratio (<10%)');
        } else if (taxRatio < 0.25) {
            score += 25;
            factors.push('+25: Good Tax-to-Value Ratio (<25%)');
        } else if (taxRatio < 0.5) {
            score += 10;
            factors.push('+10: Fair Tax-to-Value Ratio (<50%)');
        } else {
            factors.push('+0: High Tax-to-Value Ratio (>50%)');
        }
    } else {
        factors.push('+0: Assessed Value Unknown');
    }

    if (property.improvement_value && property.improvement_value > 0) {
        score += 10;
        factors.push('+10: Has Improvements (Not just land)');
    }

    // 3. Strategic Modifiers (20 points)
    if (property.is_qoz) {
        score += 10;
        factors.push('+10: Qualified Opportunity Zone');
    }
    if (property.zoning && !property.zoning.toLowerCase().includes('unknown')) {
        score += 10;
        factors.push('+10: Defined Zoning');
    }

    // Cap at 100
    score = Math.min(score, 100);

    // Grading Curve
    let rating: DealScoreResult['rating'] = 'F';
    if (score >= 90) rating = 'A+';
    else if (score >= 80) rating = 'A';
    else if (score >= 65) rating = 'B';
    else if (score >= 50) rating = 'C';
    else if (score >= 35) rating = 'D';

    return { score, rating, factors };
};
