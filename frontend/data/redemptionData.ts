export interface RedemptionRule {
    state: string;
    auction_type: string;
    type: 'Deed' | 'Lien' | 'Foreclosure' | 'Other';
    maxInterest: string;
    redemptionPeriod: string;
}

export const redemptionRules: RedemptionRule[] = [
    // Deed
    { state: 'Maine', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '8%', redemptionPeriod: '24' },
    { state: 'Hawaii', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '12%', redemptionPeriod: '12' },
    { state: 'Tennessee', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '12%', redemptionPeriod: '12' },
    { state: 'Georgia', auction_type: 'Non-Judicial Sales', type: 'Deed', maxInterest: '20%', redemptionPeriod: '12' },
    { state: 'Rhode Island', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '16%', redemptionPeriod: '12' },
    { state: 'Connecticut', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '18%', redemptionPeriod: '6' },
    { state: 'Massachusetts', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '16%', redemptionPeriod: '6' },
    { state: 'Texas', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '25%', redemptionPeriod: '6 - 24' },
    { state: 'Delaware', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '15%', redemptionPeriod: '2' },
    { state: 'Georgia', auction_type: 'Judicial Sales', type: 'Deed', maxInterest: '20%', redemptionPeriod: '2' },
    { state: 'Arkansas', auction_type: 'Leftover Tax Deed Auctions', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'California', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Florida', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Illinois', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Louisiana', auction_type: 'Adjudicated Sales', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'North Carolina', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'North Carolina', auction_type: 'Upset Sales', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Ohio', auction_type: 'Sheriff Sales', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Pennsylvania', auction_type: 'Repository Sales', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Virginia', auction_type: 'Tax Foreclosure Sales', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Washington', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Colorado', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Minnesota', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Arizona', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Indiana', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Kansas', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Nevada', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'New Hampshire', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'New Mexico', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Idaho', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Oregon', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Wisconsin', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'New York', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Utah', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Alaska', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Oklahoma', auction_type: 'Tax Deed Auctions (Annual)', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Arkansas', auction_type: 'Tax Deed Auctions (Annual)', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Michigan', auction_type: 'Tax Deed Auctions (Annual)', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Michigan', auction_type: 'Re-Offer Sales', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Michigan', auction_type: 'No Reserve Sales', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'North Dakota', auction_type: 'Tax Deed Auctions', type: 'Deed', maxInterest: '-', redemptionPeriod: '0' },
    { state: 'Pennsylvania', auction_type: 'Private Sales', type: 'Deed', maxInterest: '-', redemptionPeriod: '-' },
    { state: 'Pennsylvania', auction_type: 'Judicial Sales', type: 'Deed', maxInterest: '-', redemptionPeriod: '-' },
    { state: 'Pennsylvania', auction_type: 'Upset Sales', type: 'Deed', maxInterest: '-', redemptionPeriod: '-' },

    // Foreclosure
    { state: 'Colorado', auction_type: 'Foreclosure Auctions', type: 'Foreclosure', maxInterest: '-', redemptionPeriod: '-' },
    { state: 'Delaware', auction_type: 'Sheriff Sales', type: 'Foreclosure', maxInterest: '-', redemptionPeriod: '-' },
    { state: 'Florida', auction_type: 'Foreclosure Auctions', type: 'Foreclosure', maxInterest: '-', redemptionPeriod: '-' },
    { state: 'Indiana', auction_type: 'Foreclosure Auctions', type: 'Foreclosure', maxInterest: '-', redemptionPeriod: '-' },
    { state: 'Maine', auction_type: 'Foreclosure Auctions', type: 'Foreclosure', maxInterest: '-', redemptionPeriod: '-' },
    { state: 'Oregon', auction_type: 'Foreclosure Auctions', type: 'Foreclosure', maxInterest: '-', redemptionPeriod: '-' },
    { state: 'South Carolina', auction_type: 'Foreclosure Auctions', type: 'Foreclosure', maxInterest: '-', redemptionPeriod: '-' },
    { state: 'Washington', auction_type: 'Sheriff Sales', type: 'Foreclosure', maxInterest: '-', redemptionPeriod: '-' },

    // Lien
    { state: 'Alabama', auction_type: 'Tax Lien Auctions', type: 'Lien', maxInterest: '12%', redemptionPeriod: '48' },
    { state: 'Wyoming', auction_type: 'Tax Lien Auctions', type: 'Lien', maxInterest: '15%', redemptionPeriod: '48' },
    { state: 'Arizona', auction_type: 'Tax Lien Auctions (Annual)', type: 'Lien', maxInterest: '16%', redemptionPeriod: '36' },
    { state: 'Nebraska', auction_type: 'Tax Lien Auctions', type: 'Lien', maxInterest: '14%', redemptionPeriod: '36' },
    { state: 'Alabama', auction_type: 'Tax Cert Auctions (Classic)', type: 'Lien', maxInterest: '8%', redemptionPeriod: '36' },
    { state: 'Louisiana', auction_type: 'Tax Lien Auctions', type: 'Lien', maxInterest: '12%', redemptionPeriod: '36' },
    { state: 'Montana', auction_type: 'Tax Lien Auctions', type: 'Lien', maxInterest: '10%', redemptionPeriod: '36' },
    { state: 'Vermont', auction_type: 'Tax Lien Auctions', type: 'Lien', maxInterest: '12%', redemptionPeriod: '36' },
    { state: 'Colorado', auction_type: 'Tax Lien Auctions (Annual)', type: 'Lien', maxInterest: '14%', redemptionPeriod: '36' },
    { state: 'South Dakota', auction_type: 'Tax Lien Auctions', type: 'Lien', maxInterest: '10%', redemptionPeriod: '36' },
    { state: 'New Jersey', auction_type: 'Tax Lien Auctions', type: 'Lien', maxInterest: '18%', redemptionPeriod: '24' },
    { state: 'New York', auction_type: 'Tax Lien Auctions', type: 'Lien', maxInterest: '20%', redemptionPeriod: '24' },
    { state: 'Mississippi', auction_type: 'Spring Tax Lien Auctions', type: 'Lien', maxInterest: '12%', redemptionPeriod: '24' },
    { state: 'Nevada', auction_type: 'Tax Lien Auctions', type: 'Lien', maxInterest: '12%', redemptionPeriod: '24' },
    { state: 'Florida', auction_type: 'Tax Lien Auctions (Annual)', type: 'Lien', maxInterest: '18%', redemptionPeriod: '24' },
    { state: 'Iowa', auction_type: 'Tax Lien Auctions (Annual)', type: 'Lien', maxInterest: '24%', redemptionPeriod: '24' },
    { state: 'Mississippi', auction_type: 'Fall Tax Lien Auctions', type: 'Lien', maxInterest: '12%', redemptionPeriod: '24' },
    { state: 'West Virginia', auction_type: 'Tax Lien Auctions', type: 'Lien', maxInterest: '7%', redemptionPeriod: '18' },
    { state: 'South Carolina', auction_type: 'Tax Lien Auctions', type: 'Lien', maxInterest: '12%', redemptionPeriod: '12' },
    { state: 'Ohio', auction_type: 'Tax Lien Auctions', type: 'Lien', maxInterest: '18%', redemptionPeriod: '12' },
    { state: 'Kentucky', auction_type: 'Tax Lien Auctions', type: 'Lien', maxInterest: '12%', redemptionPeriod: '12' },
    { state: 'Indiana', auction_type: 'Treasurer\'s Sales', type: 'Lien', maxInterest: '15%', redemptionPeriod: '12' },
    { state: 'Missouri', auction_type: 'Tax Lien Auctions (1st)', type: 'Lien', maxInterest: '10%', redemptionPeriod: '12' },
    { state: 'Missouri', auction_type: 'Tax Lien Auctions (2nd)', type: 'Lien', maxInterest: '10%', redemptionPeriod: '12' },
    { state: 'Maryland', auction_type: 'Tax Lien Auctions (Annual)', type: 'Lien', maxInterest: '24%', redemptionPeriod: '6 - 9' },
    { state: 'Washington, DC', auction_type: 'Tax Lien Auctions', type: 'Lien', maxInterest: '18%', redemptionPeriod: '6' },
    { state: 'Illinois', auction_type: 'Tax Lien Auctions', type: 'Lien', maxInterest: '18%', redemptionPeriod: '6 - 36' },
    { state: 'Indiana', auction_type: 'Commissioner\'s Sales', type: 'Lien', maxInterest: '10%', redemptionPeriod: '4' },
    { state: 'Missouri', auction_type: 'Post-Third Sales', type: 'Lien', maxInterest: '10%', redemptionPeriod: '3' },
    { state: 'Missouri', auction_type: 'Tax Lien Auctions (3rd)', type: 'Lien', maxInterest: '10%', redemptionPeriod: '3' }
];

export const redemptionDefinitions = {
    taxLien: {
        title: "Tax Lien",
        content: "A legal claim by the government on a property due to unpaid taxes. The investor buys the right to collect the debt with high interest (up to 36% annually, depending on the state). The investor does not immediately own the property."
    },
    taxDeed: {
        title: "Tax Deed",
        content: "A document transferring total ownership of a property to the government or a third party after a long period of unpaid taxes. The auction winner typically becomes the new legal owner."
    },
    foreclosure: {
        title: "Foreclosure",
        content: "The legal process by which a lender (usually a bank) takes possession of a property because the owner stopped paying the mortgage. Foreclosures usually involve bank debt, unlike Tax Liens/Deeds which involve government debt."
    },
    redemptionPeriod: {
        title: "Redemption Period",
        content: "A legal timeframe (ranging from months to years) where the original owner can still recover the property by paying the accumulated debt with interest."
    },
    quietTitle: {
        title: "Quiet Title",
        content: "A judicial process that auction investors often undertake to 'clean' the deed of any other debts or past errors before selling the property on the open market."
    }
};
