// Capabilities endpoints.

import { asyncHandler } from '../../utils/async-handler.js';
import * as capabilityService from './capability.service.js';

export const listCapabilities = asyncHandler(async (_req, res) => {
  res.json({ capabilities: await capabilityService.listCapabilities() });
});

export const getCapability = asyncHandler(async (req, res) => {
  const capability = await capabilityService.getCapabilityById(req.params.capabilityId);
  if (!capability) return res.status(404).json({ error: { message: 'Capability not found' } });
  res.json({ capability });
});