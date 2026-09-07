import { useEffect, useState } from 'react';
import { fetchRisks } from '../api/risks.js';
import { fetchInsights } from '../api/insights.js';

const WATCH_SEVERITIES = ['critical', 'high'];

/**
 * Sidebar badge counts, derived from the same data the pages render so they
 * never drift from what the user sees:
 *  - /risks: open critical/high risks
 *  - /insights: insights currently surfaced by the backend
 * Errors silently drop the badge (nav still works without it).
 */
export function useSidebarBadges() {
  const [badges, setBadges] = useState({});

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchRisks(), fetchInsights()])
      .then(([risks, insights]) => {
        if (cancelled) return;
        setBadges({
          '/risks': risks.filter((risk) => risk.status === 'open' && WATCH_SEVERITIES.includes(risk.severity)).length,
          '/insights': insights.length,
        });
      })
      .catch(() => {
        if (!cancelled) setBadges({});
      });
    return () => { cancelled = true; };
  }, []);

  return badges;
}