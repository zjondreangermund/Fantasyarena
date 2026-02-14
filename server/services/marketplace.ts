// marketplace.ts

// Marketplace price validation and trade rate limiting

// Define rarity tiers and their respective price floors and ceilings
const rarityTiers = {
    common: { floor: 1, ceiling: 10 },
    uncommon: { floor: 11, ceiling: 50 },
    rare: { floor: 51, ceiling: 200 },
    epic: { floor: 201, ceiling: 1000 },
    legendary: { floor: 1001, ceiling: 5000 },
};

// Tracking trades
const tradeLimits = {
    sell: 5,
    buy: 10,
};
const tradesCounter = {
    sell: 0,
    buy: 0,
};

// Timeframe tracking
const tradeResetTimeframe = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const lastTradeTime = Date.now();

function resetTradesCounter() {
    if (Date.now() - lastTradeTime > tradeResetTimeframe) {
        tradesCounter.sell = 0;
        tradesCounter.buy = 0;
    }
}

function validatePrice(rarity, price) {
    resetTradesCounter();
    const { floor, ceiling } = rarityTiers[rarity] || {};
    if (!floor || !ceiling) {
        throw new Error('Invalid rarity tier');
    }
    if (price < floor || price > ceiling) {
        throw new Error(`Price ${price} is out of bounds for rarity ${rarity}`);
    }
}

function sellItem(rarity, price) {
    resetTradesCounter();
    if (tradesCounter.sell >= tradeLimits.sell) {
        throw new Error('Sell limit reached for the 24 hour period');
    }
    validatePrice(rarity, price);
    tradesCounter.sell++;
    // Logic to handle the selling process
}

function buyItem(rarity, price) {
    resetTradesCounter();
    if (tradesCounter.buy >= tradeLimits.buy) {
        throw new Error('Buy limit reached for the 24 hour period');
    }
    validatePrice(rarity, price);
    tradesCounter.buy++;
    // Logic to handle the buying process
}

export { sellItem, buyItem, rarityTiers };