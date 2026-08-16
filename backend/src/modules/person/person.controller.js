// People endpoints.

import { asyncHandler } from '../../utils/async-handler.js';
import * as personService from './person.service.js';

export const listPeople = asyncHandler(async (_req, res) => {
  res.json({ people: await personService.listPeople() });
});

export const getPerson = asyncHandler(async (req, res) => {
  const person = await personService.getPersonById(req.params.personId);
  if (!person) return res.status(404).json({ error: { message: 'Person not found' } });
  res.json({ person });
});