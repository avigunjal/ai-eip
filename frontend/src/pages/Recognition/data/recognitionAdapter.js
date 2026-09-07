/**
 * Recognition insights derived from the live `/api/recognition/feed` DTO.
 *
 * Award eligibility arrives from the backend deterministic eligibility engine
 * (per-person `award.highestQualifiedLevel`, evaluated highest → lowest with
 * mutual exclusion). Evidence counts now reflect real linked evidence rows.
 * Everything else — KPIs, trends, contributors — is derived here from the same
 * public feed. All values stay honest: computed from live data, never fabricated.
 */
import dayjs from 'dayjs';
import { AWARD_LEVELS, AWARD_LEVEL_ORDER } from './awardLevels.js';

/** A fully-specified evidence bundle is one primary + one supporting piece. */
const EVIDENCE_REFERENCE = 2;

const isPublic = (r) => r.visibility === 'public';

function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}

function personMeta(embedded, peopleById) {
  const fixture = embedded?.id ? peopleById.get(embedded.id) : null;
  return fixture
    ? { id: fixture.id, name: fixture.name, initials: fixture.initials, avatarColor: fixture.avatarColor }
    : {
        id: embedded?.id ?? 'unknown',
        name: embedded?.name ?? 'Team member',
        initials: initialsOf(embedded?.name),
        avatarColor: 'var(--primary)',
      };
}

function buildTrends(items, now = dayjs()) {
  const start = now.startOf('month').subtract(5, 'month');
  const months = Array.from({ length: 6 }, (_, i) => {
    const m = start.add(i, 'month');
    return {
      key: m.format('YYYY-MM'),
      label: m.format('MMM'),
      reliability: 0,
      delivery: 0,
      mentorship: 0,
      knowledge_sharing: 0,
      innovation: 0,
    };
  });
  const byKey = new Map(months.map((m) => [m.key, m]));
  items.forEach((r) => {
    const bucket = byKey.get(dayjs(r.occurredAt).format('YYYY-MM'));
    if (bucket && typeof bucket[r.type] === 'number') bucket[r.type] += 1;
  });
  return months;
}

function buildContributors(items, peopleById) {
  const counts = new Map();
  items.forEach((r) => counts.set(r.personId, (counts.get(r.personId) ?? 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([personId, count], i) => ({
      rank: i + 1,
      person:
        peopleById.get(personId) ??
        items.find((r) => r.personId === personId)?.person ?? { id: personId, name: 'Team member', initials: '?', avatarColor: 'var(--primary)' },
      count,
    }));
}

export function buildRecognitionInsights(feed = [], people = []) {
  const peopleById = new Map(people.map((p) => [p.id, p]));
  const publicItems = feed.filter(isPublic);

  if (publicItems.length === 0) {
    return {
      isEmpty: true,
      items: [],
      kpis: [],
      awardLevels: AWARD_LEVEL_ORDER.map((key) => ({ ...AWARD_LEVELS[key], recipients: 0 })),
      trends: buildTrends([]),
      contributors: [],
    };
  }

  // Award levels: each person's highest qualified level, as decided by the
  // backend eligibility engine (mutually exclusive, highest → lowest). The
  // same level is stamped on every contribution of that person.
  const items = publicItems.map((r) => ({
    ...r,
    person: personMeta(r.person, peopleById),
    awardLevel: r.award?.highestQualifiedLevel ?? null,
  }));

  const avgEvidence = items.length
    ? items.reduce((sum, r) => sum + (r.evidence?.length ?? 0), 0) / items.length
    : 0;
  const evidenceScore = Math.min(100, Math.round((avgEvidence / EVIDENCE_REFERENCE) * 100));
  const uniquePeopleOf = (arr) => new Set(arr.map((r) => r.personId)).size;
  const uniqueProjectsOf = (arr) => new Set(arr.map((r) => r.project?.id).filter(Boolean)).size;

  const kpis = [
    {
      key: 'total',
      label: 'Verified Recognitions',
      value: items.length,
      detail: 'verified with evidence',
    },
    {
      key: 'people',
      label: 'Unique Contributors',
      value: uniquePeopleOf(items),
      detail: 'people recognized',
    },
    {
      key: 'projects',
      label: 'Projects Impacted',
      value: uniqueProjectsOf(items),
      detail: 'across all recognitions',
    },
    {
      key: 'evidence',
      label: 'Average Evidence Score',
      value: `${evidenceScore}%`,
      detail: 'avg evidence per recognition',
      help: `How well recognitions are backed by verified evidence. Each recognition is scored against a full ${EVIDENCE_REFERENCE}-piece evidence bundle — one primary (person-attributed) plus one supporting (\`number of evidence items ÷ ${EVIDENCE_REFERENCE} × 100\`).`,
    },
  ];

  // Recipients by highest qualified level (distinct people, server-mediated).
  const recipientLevels = new Map(items.filter((r) => r.awardLevel).map((r) => [r.personId, r.awardLevel]));
  const recipients = new Map(AWARD_LEVEL_ORDER.map((key) => [key, 0]));
  recipientLevels.forEach((level) => recipients.set(level, (recipients.get(level) ?? 0) + 1));
  const awardLevels = AWARD_LEVEL_ORDER.map((key) => ({
    ...AWARD_LEVELS[key],
    recipients: recipients.get(key) ?? 0,
  }));

  return {
    isEmpty: false,
    items,
    kpis,
    awardLevels,
    trends: buildTrends(items),
    contributors: buildContributors(items, peopleById),
  };
}