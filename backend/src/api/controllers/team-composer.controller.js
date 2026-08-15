// Team composer handlers.

export async function listTeams(_req, res, next) {
  try {
    res.json({ teams: [] });
  } catch (err) {
    next(err);
  }
}

export async function getRecommendations(_req, res, next) {
  try {
    // TODO: use analytics/contribution + modules/team-composer services
    res.json({ recommendations: [] });
  } catch (err) {
    next(err);
  }
}
