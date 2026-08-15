// Knowledge handlers.

export async function listAreas(_req, res, next) {
  try {
    res.json({ areas: [] });
  } catch (err) {
    next(err);
  }
}

export async function getSystem(req, res, next) {
  try {
    const { systemId } = req.params;
    res.json({ system: { id: systemId } });
  } catch (err) {
    next(err);
  }
}
