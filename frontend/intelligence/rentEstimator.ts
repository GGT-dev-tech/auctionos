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

    // Calculate Internal Base Rent Yield Percentage
    let yieldMod = 0.008; // Base 0.8%

    const details = property.details as any || {};
    const type = (property.property_type || details.property_type || '').toLowerCase();
    const beds = Number(property.bedrooms || details.bedrooms || 0);
    const sqft = Number(property.sqft || details.sqft || details.building_area_sqft || (property as any).building_area_sqft || 0);

    // Adjust based on property type internal data
    if (type.includes('multi') || type.includes('duplex') || type.includes('triplex')) {
        yieldMod = 0.01; // 1% multi-family
    } else if (type.includes('commercial')) {
        yieldMod = 0.009; 
    } else if (type.includes('single')) {
        yieldMod = 0.0075;
    }

    // Adjust based on beds
    if (beds > 0) {
        if (beds >= 4) yieldMod -= 0.0005; // Larger homes have slightly lower yield ratios
        if (beds <= 2) yieldMod += 0.0005; // Smaller units have slightly higher yield ratios
    }

    // Calculate structural rent baseline
    let monthlyRent = arv.value * yieldMod;

    // Sanity check against sqft minimums (e.g. $1/sqft minimum if sqft is known)
    if (sqft > 0) {
        const sqftMinimum = sqft * 1.0; 
        if (monthlyRent < sqftMinimum && arv.confidence !== 'High') {
            monthlyRent = sqftMinimum;
        }
    }

    const annualRent = monthlyRent * 12;

    if (monthlyRent > 0 && monthlyRent < 100) {
        return {
            monthlyRent: 0, annualRent: 0, yieldPercentage: 0,
            confidence: 'Low', calculationMethod: 'Below minimum viability'
        }
    }

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
        calculationMethod: `Internal RVN Yield Matrix (${(yieldMod * 100).toFixed(2)}%)`
    };
};
