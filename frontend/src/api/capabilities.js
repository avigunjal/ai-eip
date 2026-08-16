import { http } from './client.js';

/**
 * Capability endpoints.
 */

/**
 * @returns {Promise<Capability[]>}
 */
export async function fetchCapabilities() {
  const { capabilities } = await http.get('/capabilities');
  return capabilities;
}

/**
 * @param {string} capabilityId
 * @returns {Promise<Capability>}
 */
export async function fetchCapability(capabilityId) {
  const { capability } = await http.get(`/capabilities/${capabilityId}`);
  return capability;
}