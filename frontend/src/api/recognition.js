import { http } from './client.js';

/**
 * Recognition / impact endpoints.
 */

/**
 * @returns {Promise<Recognition[]>}
 */
export async function fetchRecognitionFeed() {
  const { feed } = await http.get('/recognition/feed');
  return feed;
}

/**
 * @param {Pick<Recognition, 'personId'|'type'|'summary'|'occurredAt'|'visibility'>} payload
 * @returns {Promise<Recognition>}
 */
export async function createRecognition(payload) {
  const { recognition } = await http.post('/recognition', payload);
  return recognition;
}