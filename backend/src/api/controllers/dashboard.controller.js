// Dashboard handlers: transform service results into HTTP responses.

// TODO: call dashboard service + analytics/project-risk once implemented.
export async function getOverview(_req, res, next) {
  try {
    res.json({ health: 78, projectsAtRisk: 3, knowledgeConcentration: 'High', teamCapacity: 82, recognizedImpact: 14 });
  } catch (err) {
    next(err);
  }
}

export async function getInsights(_req, res, next) {
  try {
    res.json({ insights: [] });
  } catch (err) {
    next(err);
  }
}
