/**
 * Extracts top N games from raw data based on rank field
 * Validates that games have required fields (name, id/app_id) before including
 * @param {Array} rawData - Raw data from store API (nested arrays)
 * @param {number} limit - Number of top games to return
 * @returns {Array} - Top N raw games sorted by rank (with required fields)
 */
const extractTopGamesByRank = (rawData, limit) => {
  if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
    return [];
  }

  // Flatten all games with their ranks and validate required fields
  const validGames = rawData
    .flat()
    .filter((g) => {
      if (!g || typeof g !== 'object' || !g.rank) return false;
      // Validate required fields: name and id/app_id
      const hasName = g.name || g.title;
      const hasId = g.id || g.app_id || g.storeId || g.store_id;
      return hasName && hasId;
    });

  // Sort by rank and take top N
  return validGames
    .sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity))
    .slice(0, limit);
};

module.exports = { extractTopGamesByRank };
