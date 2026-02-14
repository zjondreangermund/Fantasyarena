/**
 * Calculate player XP based on real-world player stats.
 * @param {number} goals - The number of goals scored.
 * @param {number} assists - The number of assists made.
 * @param {number} appearances - The number of appearances.
 * @param {number} cleanSheets - The number of clean sheets.
 * @param {number} cards - The number of cards received.
 * @param {number} ownGoals - The number of own goals scored.
 * @param {number} minutes - The number of minutes played.
 * @returns {number} - The calculated XP.
 */
function calculatePlayerXP(goals, assists, appearances, cleanSheets, cards, ownGoals, minutes) {
    const xpValues = {
        goals: 10,
        assists: 5,
        appearances: 2,
        cleanSheets: 7,
        cards: -3,
        ownGoals: -5,
        minutes: 1
    };

    const xp = (
        goals * xpValues.goals +
        assists * xpValues.assists +
        appearances * xpValues.appearances +
        cleanSheets * xpValues.cleanSheets +
        cards * xpValues.cards +
        ownGoals * xpValues.ownGoals +
        Math.floor(minutes / 90) * xpValues.minutes
    );

    return xp;
}

// Export the function for external use.
module.exports = calculatePlayerXP;