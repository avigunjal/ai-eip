import { http } from './client.js';

/**
 * People endpoints.
 */

/**
 * @returns {Promise<Person[]>}
 */
export async function fetchPeople() {
  const { people } = await http.get('/people');
  return people;
}

/**
 * @param {string} personId
 * @returns {Promise<Person>}
 */
export async function fetchPerson(personId) {
  const { person } = await http.get(`/people/${personId}`);
  return person;
}