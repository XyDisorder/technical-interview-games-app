const express = require('express');
const bodyParser = require('body-parser');
const { Op } = require('sequelize');
const db = require('./models');
const fetchJson = require('./utils/fetchJson');
const { mapGamesData } = require('./utils/gameMapper');
const { extractTopGamesByRank } = require('./utils/topGamesExtractor');
const gamesConfig = require('./config/gamesConfig');

const app = express();

app.use(bodyParser.json());
app.use(express.static(`${__dirname}/static`));

app.get('/api/games', (req, res) => db.Game.findAll()
  .then((games) => res.send(games))
  .catch((err) => {
    console.log('There was an error querying games', JSON.stringify(err));
    return res.send(err);
  }));

app.post('/api/games', (req, res) => {
  const { publisherId, name, platform, storeId, bundleId, appVersion, isPublished } = req.body;
  return db.Game.create({ publisherId, name, platform, storeId, bundleId, appVersion, isPublished })
    .then((game) => res.send(game))
    .catch((err) => {
      console.log('***There was an error creating a game', JSON.stringify(err));
      return res.status(400).send(err);
    });
});

app.post('/api/games/search', async (req, res) => {
  const { name, platform } = req.body;

  if (!name && !platform) {
    console.log('***No search parameters provided***');
    return db.Game.findAll()
      .then((games) => res.send(games))
      .catch((err) => {
        console.log('***There was an error searching for games', JSON.stringify(err));
        return res.status(400).send(err);
      });
  }

  const whereClause = {};
  if (name) {
    whereClause.name = {
      [Op.like]: `%${name}%`,
    };
  }
  if (platform) {
    whereClause.platform = platform;
  }

  try {
    const searchedGames = await db.Game.findAll({ where: whereClause });

    if (!searchedGames.length) {
      console.log('***No games found***');
      return res.status(204).send([]);
    }

    return res.send(searchedGames);
  } catch (err) {
    console.log('***There was an error searching for games', JSON.stringify(err));
    return res.status(400).send(err);
  }
});

app.delete('/api/games/:id', (req, res) => {
  // eslint-disable-next-line radix
  const id = parseInt(req.params.id);
  return db.Game.findByPk(id)
    .then((game) => game.destroy({ force: true }))
    .then(() => res.send({ id }))
    .catch((err) => {
      console.log('***Error deleting game', JSON.stringify(err));
      res.status(400).send(err);
    });
});

app.put('/api/games/:id', (req, res) => {
  // eslint-disable-next-line radix
  const id = parseInt(req.params.id);
  return db.Game.findByPk(id)
    .then((game) => {
      const { publisherId, name, platform, storeId, bundleId, appVersion, isPublished } = req.body;
      return game.update({ publisherId, name, platform, storeId, bundleId, appVersion, isPublished })
        .then(() => res.send(game))
        .catch((err) => {
          console.log('***Error updating game', JSON.stringify(err));
          res.status(400).send(err);
        });
    });
});

app.post('/api/games/populate', async (req, res) => {
  let transaction;

  try {
    // Fetch data from both sources in parallel
    const [iosData, androidData] = await Promise.all([
      fetchJson(gamesConfig.iosUrl),
      fetchJson(gamesConfig.androidUrl),
    ]);

    // Extract top 100 from raw data based on rank field
    const topIosRawGames = extractTopGamesByRank(iosData, gamesConfig.topAppRank);
    const topAndroidRawGames = extractTopGamesByRank(androidData, gamesConfig.topAppRank);

    // Map only the top 100 games to database format
    const iosGames = mapGamesData(topIosRawGames, 'ios');
    const androidGames = mapGamesData(topAndroidRawGames, 'android');

    const allGames = [...iosGames, ...androidGames];

    if (allGames.length === 0) {
      return res.status(400).send({ error: 'No games found in the fetched data' });
    }


    transaction = await db.sequelize.transaction();

    // Use bulkCreate within transaction - duplicates will be created as separate entries
    // In production, you'd want a unique constraint on (storeId, platform)
    const createdGames = await db.Game.bulkCreate(allGames, {
      ignoreDuplicates: false,
      transaction,
    });

    await transaction.commit();

    return res.send({
      message: `Successfully populated ${createdGames.length} games ` +
        `(${iosGames.length} iOS, ${androidGames.length} Android)`,
      count: createdGames.length,
    });
  } catch (err) {
    // Rollback transaction if it was started
    if (transaction) {
      await transaction.rollback();
    }
    console.log('***Error populating games', JSON.stringify(err));
    return res.status(500).send({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Server is up on port 3000');
});

module.exports = app;
