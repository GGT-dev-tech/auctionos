import { Property } from '../types';

export interface ARVEstimate {
    value: number;
    confidence: 'High' | 'Medium' | 'Low' | 'Insufficient Data';
    calculationMethod: string;
}

export const estimateARV = (property: Property): ARVEstimate => {
    // Priority 1: Direct estimate from external sources (e.g. Zillow/Redfin)
    // Note: Assuming these fields might be added or are available in property.details
    const zillowEstimate = (property.details as any)?.zillow_estimate || property.redfin_estimate;
    
    if (zillowEstimate && typeof zillowEstimate === 'number') {
        return {
            value: zillowEstimate,
            confidence: 'High',
            calculationMethod: 'External AVM (Zillow/Redfin)'
        };
    }

    // Priority 2: Mathematical proxy via Assessed Value
    const assessed = property.assessed_value || 0;
    const landValue = property.land_value || 0;
    const improvements = property.improvement_value || 0;

    // Basic rule: Market value is typically 1.25x - 2.0x assessed value depending on the county.
    // For this engine we use a 1.5x multiplier.
    if (assessed > 0) {
        // If there are improvements, we have higher confidence
        const confidence = improvements > 0 ? 'Medium' : 'Low';
        return {
            value: assessed * 1.5,
            confidence,
            calculationMethod: 'Proxy: Assessed Value x 1.5'
        };
    }

    // Priority 3: Insufficient Data
    return {
        value: 0,
        confidence: 'Insufficient Data',
        calculationMethod: 'Need more data to estimate'
    };
};
