// Knowledge concentration engine.
// TODO: detect single-owner systems and fragile expertise.

export function concentrationScore(area) {
  // Lower coverage + higher criticality => higher concentration risk.
  return { concentration: 0, singleOwner: false };
}
