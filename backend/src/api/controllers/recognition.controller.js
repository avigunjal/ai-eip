// Recognition handlers.

export async function getFeed(_req, res, next) {
  try {
    res.json({ feed: [] });
  } catch (err) {
    next(err);
  }
}

export async function sendRecognition(req, res, next) {
  try {
    const body = req.body;
    // TODO: validate payload, require human confirmation flag
    res.status(201).json({ recognition: { ...body, id: 'new' } });
  } catch (err) {
    next(err);
  }
}
