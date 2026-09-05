import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Search from '@mui/icons-material/Search';
import Gavel from '@mui/icons-material/Gavel';
import FactCheck from '@mui/icons-material/FactCheck';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingState from '../../../components/common/LoadingState.jsx';
import ErrorState from '../../../components/common/ErrorState.jsx';
import { AWARD_LEVELS } from '../data/awardLevels.js';
import { DIMENSION_LABEL } from '../data/recognitionLabels.js';
import { formatRelative } from '../../../config/dates.js';
import { paths } from '../../../config/paths.js';
import { getPeople } from '../../../data/service.js';

const CONFIDENCE_PILL = {
  high: { label: 'High', color: 'success.main', bg: 'var(--success-lighter)' },
  medium: { label: 'Medium', color: 'var(--amber)', bg: 'var(--amber-lighter)' },
  low: { label: 'Low', color: 'text.secondary', bg: 'background.default' },
};

/** Filters with live counts, ordered like the award taxonomy. */
const FILTER_ORDER = ['all', 'monthly', 'quarterly', 'eminence', 'league'];

function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}

function avatarOf(person) {
  const fixture = person?.id ? new Map(getPeople().map((p) => [p.id, p])).get(person.id) : null;
  if (fixture) return { name: fixture.name, initials: fixture.initials, avatarColor: fixture.avatarColor };
  return { name: person?.name ?? 'Team member', initials: initialsOf(person?.name), avatarColor: 'var(--primary)' };
}

/**
 * Governance Queue — the human review surface (spec sections 9-13). Renders
 * pending recommendations only: recommended award, confidence, evidence, key
 * contribution, and a Review action that opens the full evidence trail with
 * the Human Decision section. Nothing here is public; nothing here is decided
 * by AI alone.
 */
const GovernanceQueue = ({ items, loading, error, retry, onOpenDetail }) => {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const map = { all: items.length };
    for (const item of items) map[item.award?.highestQualifiedLevel] = (map[item.award?.highestQualifiedLevel] ?? 0) + 1;
    return map;
  }, [items]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      const levelMatch = filter === 'all' || item.award?.highestQualifiedLevel === filter;
      if (!levelMatch) return false;
      if (!needle) return true;
      const haystack = `${item.person?.name ?? ''} ${item.summary ?? ''} ${DIMENSION_LABEL[item.type] ?? ''}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [items, filter, query]);

  if (loading) return <LoadingState variant="grid" sx={{ mt: 3 }} />;
  if (error) return <ErrorState onRetry={retry} />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Banner — the governance stance. */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          bgcolor: 'var(--violet-lighter)',
          outline: '1px solid color-mix(in srgb, var(--violet) 30%, transparent)',
          borderRadius: 'var(--radius-card)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '999px',
            bgcolor: 'var(--violet)',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          <Gavel sx={{ fontSize: 20 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Pending Human Review</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 13.5, mt: 0.25, lineHeight: 1.55 }}>
            Every recommendation is evaluated deterministically against verified evidence — never by AI alone.
            AI recommends. Humans decide. Approving publishes the recognition to the public feed; rejecting it
            records the decision and keeps it out of the public surface.
          </Typography>
        </Box>
      </Paper>

      {/* Filters + search. */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {FILTER_ORDER.map((key) => {
            const label = key === 'all' ? 'All' : (AWARD_LEVELS[key]?.shortLabel ?? key);
            const active = filter === key;
            const count = counts[key] ?? 0;
            return (
              <Chip
                key={key}
                label={`${label} · ${count}`}
                onClick={() => setFilter(key)}
                sx={{
                  fontWeight: 700,
                  fontSize: 12.5,
                  height: 30,
                  bgcolor: active ? 'var(--primary)' : 'background.paper',
                  color: active ? '#fff' : 'text.secondary',
                  outline: '1px solid',
                  outlineColor: 'divider',
                  '&:hover': { bgcolor: active ? 'var(--primary)' : 'var(--primary-lighter)' },
                }}
              />
            );
          })}
        </Box>
        <TextField
          size="small"
          placeholder="Search people, contributions…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <Search sx={{ fontSize: 18, color: 'text.secondary', mr: 0.75 }} />,
            },
          }}
          sx={{ minWidth: { sm: 260 }, '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 'var(--radius-control)' } }}
        />
      </Box>

      {visible.length === 0 ? (
        <EmptyState
          title={items.length === 0 ? 'No pending recommendations' : 'Nothing matches'
          }
          description={
            items.length === 0
              ? 'The review queue is clear. New nominations are routed here for a human decision before anything becomes public.'
              : 'Try a different filter or search.'
          }
        />
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-card)', overflowX: 'auto' }}
        >
          <Table sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: 'background.default', color: 'text.secondary', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, borderBottom: '1px solid', borderColor: 'divider' } }}>
                <TableCell>Person</TableCell>
                <TableCell>Recommended Award</TableCell>
                <TableCell>Confidence</TableCell>
                <TableCell>Evidence</TableCell>
                <TableCell>Key Contribution</TableCell>
                <TableCell align="right">Review</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((item) => {
                const person = avatarOf(item.person);
                const level = AWARD_LEVELS[item.award?.highestQualifiedLevel] ?? null;
                const confidence = CONFIDENCE_PILL[item.confidence] ?? CONFIDENCE_PILL.medium;
                const primaryEvidence = item.evidence?.filter((e) => e.role === 'primary') ?? [];
                return (
                  <TableRow key={item.id} sx={{ '& td': { borderBottom: '1px solid', borderColor: 'divider', py: 1.5, verticalAlign: 'middle' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, fontSize: 14, bgcolor: person.avatarColor, flexShrink: 0 }}>
                          {person.initials}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                            <Link to={paths.person(item.personId)} style={{ color: 'inherit' }}>
                              {person.name}
                            </Link>
                          </Typography>
                          <Typography sx={{ color: 'text.secondary', fontSize: 11.5 }}>
                            {DIMENSION_LABEL[item.type] ?? item.type} · {formatRelative(item.occurredAt)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {level ? (
                        <Chip
                          size="small"
                          label={level.shortLabel}
                          sx={{ height: 24, fontSize: 11.5, fontWeight: 700, bgcolor: level.bg, color: level.color, '& .MuiChip-label': { px: 1.1 } }}
                        />
                      ) : (
                        <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box
                        component="span"
                        sx={{ display: 'inline-flex', alignItems: 'center', px: 1, height: 24, borderRadius: '999px', fontSize: 11.5, fontWeight: 700, bgcolor: confidence.bg, color: confidence.color }}
                      >
                        {confidence.label}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 13 }}>
                        {item.evidence?.length ?? 0} {item.evidence?.length === 1 ? 'piece' : 'pieces'}
                      </Typography>
                      {primaryEvidence.length > 0 && (
                        <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mt: 0.25 }}>
                          {primaryEvidence[0].statement.split(' ').slice(0, 8).join(' ')}…
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.5 }}>
                        {item.summary}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<FactCheck sx={{ fontSize: 15 }} />}
                        onClick={() => onOpenDetail?.(item)}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '999px' }}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default GovernanceQueue;