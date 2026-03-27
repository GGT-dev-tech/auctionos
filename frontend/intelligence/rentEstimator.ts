import { Property } from '../types';
import { estimateARV } from './arvEstimator';

export interface RentEstimate {
    monthlyRent: number;
    annualRent: number;
    yieldPercentage: number;
    confidence: 'High' | 'Medium' | 'Low' | 'Insufficient Data';
    calculationMethod: string;
}

export const estimateRent = (property: Property): RentEstimate => {
    // Step 1: Get ARV to use as a baseline for the 1% rule (or 0.8% rule)
    const arv = estimateARV(property);
    
    if (arv.confidence === 'Insufficient Data' || arv.value === 0) {
        return {
            monthlyRent: 0,
            annualRent: 0,
            yieldPercentage: 0,
            confidence: 'Insufficient Data',
            calculationMethod: 'Missing baseline value'
        };
    }

    // Basic Rule-of-Thumb: 0.8% of ARV per month
    const monthlyRent = arv.value * 0.008;
    const annualRent = monthlyRent * 12;

    // Calculate Yield based on Estimated Acquisition Cost (Taxes Due)
    // Yield = (Annual Rent / Acquisition Cost) * 100
    const acquisitionCost = property.amount_due || 0;
    let yieldPercentage = 0;

    if (acquisitionCost > 0) {
        yieldPercentage = (annualRent / acquisitionCost) * 100;
        // Cap yield at 999% to avoid absurd numbers for extremely low taxes
        yieldPercentage = Math.min(yieldPercentage, 999.99);
    }

    return {
        monthlyRent: Math.round(monthlyRent),
        annualRent: Math.round(annualRent),
        yieldPercentage: Number(yieldPercentage.toFixed(2)),
        confidence: arv.confidence === 'High' ? 'Medium' : 'Low',
        calculationMethod: 'Proxy: 0.8% of Estimated Value'
    };
};
