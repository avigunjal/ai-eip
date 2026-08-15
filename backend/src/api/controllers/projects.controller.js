// Projects handlers.

export async function listProjects(_req, res, next) {
  try {
    // TODO: apply filters (status, team, risk, owner) from req.query
    res.json({ projects: [] });
  } catch (err) {
    next(err);
  }
}

export async function getProject(req, res, next) {
  try {
    const { projectId } = req.params;
    res.json({ project: { id: projectId } });
  } catch (err) {
    next(err);
  }
}

export async function getProjectRisks(req, res, next) {
  try {
    const { projectId } = req.params;
    res.json({ projectId, risks: [] });
  } catch (err) {
    next(err);
  }
}
