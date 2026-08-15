// AI handlers: generate insights, fetch evidence.

export async function generateInsights(_req, res, next) {
  try {
    // TODO: call ai/orchestrator + analytics engines
    res.json({ insights: [] });
  } catch (err) {
    next(err);
  }
}

export async function getEvidence(req, res, next) {
  try {
    const { entityId } = req.params;
    res.json({ entityId, evidence: [] });
  } catch (err) {
    next(err);
  }
}
