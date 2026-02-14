// competitions.ts

// Competition Tier Access Validation
const validateAccess = (userTier: string) => {
    const tiers = ['free', 'paid'];
    if (!tiers.includes(userTier)) {
        throw new Error('Invalid tier');
    }
    return true;
};

// Rarity-based Lineup Requirements
const validateLineup = (userTier: string, lineup: string[]) => {
    if (userTier === 'free') {
        return lineup.every(card => card.rarity === 'common');
    } else if (userTier === 'paid') {
        return lineup.every(card => card.rarity === 'rare' || card.rarity === 'legendary');
    }
};

// Prize Distribution Logic
const distributePrizes = (totalPrize: number) => {
    return {
        first: totalPrize * 0.6,
        second: totalPrize * 0.3,
        third: totalPrize * 0.1
    };
};

// Reward Notification Generation
const generateRewardNotification = (user: string, prizes: object) => {
    return `Congratulations ${user}! You have won the following prizes: \n First Place: ${prizes.first}, Second Place: ${prizes.second}, Third Place: ${prizes.third}`;
};

export { validateAccess, validateLineup, distributePrizes, generateRewardNotification };