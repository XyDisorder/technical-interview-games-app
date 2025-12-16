/**
 * Maps an array of raw games to Game model format
 * Handles both flat arrays and nested arrays (array of arrays)
 * For nested arrays, extracts one game per sub-array (each sub-array represents a rank)
 * @param {Array} data - Raw data from store API
 * @param {string} platform - Platform identifier ('ios' or 'android')
 * @returns {Array} - Array of mapped game data
 */
const mapGamesData = (data, platform) => {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  // Extract games: if nested arrays, take first game from each sub-array
  // Each sub-array represents a rank position
  let games = data;
  if (data.some(Array.isArray)) {
    games = data
      .map((subArray) => {
        if (!Array.isArray(subArray)) return subArray;
        // Get first valid game object from sub-array
        const validGames = subArray.filter((g) => g && typeof g === 'object');
        return validGames.length > 0 ? validGames[0] : null;
      })
      .filter(Boolean);
  }

  // Map to database format (preserve rank for sorting)
  return games.map((rawGame) => ({
    publisherId: rawGame.publisherId || rawGame.publisher_id || rawGame.publisher || '',
    name: rawGame.name || rawGame.title || '',
    platform,
    storeId: rawGame.storeId || rawGame.store_id || rawGame.id || rawGame.app_id || '',
    bundleId: rawGame.bundleId || rawGame.bundle_id || rawGame.package || '',
    appVersion: rawGame.appVersion || rawGame.app_version || rawGame.version || '',
    isPublished: rawGame.isPublished !== undefined ? rawGame.isPublished : true,
    rank: rawGame.rank || null,
  }));
};

module.exports = { mapGamesData };
