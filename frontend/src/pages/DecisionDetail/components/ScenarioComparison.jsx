import { keyframes } from '@emotion/react';
import { Box, Chip, Typography } from '@mui/material';
import Check from '@mui/icons-material/Check';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import Surface from '../../../components/styled/Surface.jsx';
import { sparkleSpin } from '../../../config/animations.js';

const TONE_COLOR = { good: 'var(--teal)', warn: 'var(--amber)', critical: 'var(--red)' };

/** Soft outline pulse on the column the user asked to compare ("View simulation"). */
const focusPulse = keyframes`
  0%, 100% { box-shadow: inset 0 0 0 0 color-mix(in srgb, var(--primary) 0%, transparent); }
  50% { box-shadow: inset 0 0 0 3px color-mix(in srgb, var(--primary) 50%, transparent); }
`;

/** Per-column selection state: Recommended ≠ Selected, they can combine. */
const stateOf = (option, recommendedId, selectedId, focusId) => ({
  recommended: option.id === recommendedId,
  selected: option.id === selectedId,
  focused: focusId !== null && option.id === focusId,
});

/** Selected columns get a primary top-accent so the state never reads as color only. */
const ColumnHeader = ({ state, children }) => (
  <Box
    component="th"
    scope="col"
    sx={{
      width: '26%',
      p: '12px 16px',
      whiteSpace: 'normal',
      verticalAlign: 'top',
      bgcolor: state.recommended || state.selected ? 'var(--primary-lighter)' : 'var(--surface-subtle)',
      borderBottom: state.selected ? '2px solid var(--primary)' : 'unset',
      borderBottomColor: state.selected ? 'var(--primary)' : 'divider',
      borderLeft: '1px solid',
      borderLeftColor: state.recommended || state.selected ? 'color-mix(in srgb, var(--primary) 35%, transparent)' : 'divider',
      ...(state.focused ? { animation: `${focusPulse} 1.1s ease-in-out 2` } : {}),
    }}
  >
    {children}
  </Box>
);

/**
 * Section 04 — Compare expected outcomes (spec §14/§15): a semantic table that
 * makes trade-offs visually obvious. The AI-recommended column is tinted
 * subtly; the user-selected column carries a primary top-accent + "Selected"
 * label. On narrow screens the first column stays pinned while the table
 * scrolls horizontally.
 */
const ScenarioComparison = ({ outcomeRows, options, scores, selectedId = null, recommendedId, focusId = null }) => {
  const scoreRow = scores
    ? {
        label: 'Decision score',
        values: options.map((option) => {
          const entry = scores.find((s) => s.optionId === option.id);
          const isTop = scores[0]?.optionId === option.id;
          return { value: String(Math.round(entry?.score ?? 0)), tone: isTop ? 'good' : 'neutral' };
        }),
      }
    : null;
  const rows = scoreRow ? [...outcomeRows, scoreRow] : outcomeRows;

  return (
    <Surface sx={{ overflow: 'hidden' }}>
      <Box sx={{ overflowX: 'auto' }}>
        <Box
          component="table"
          aria-label="Expected outcome comparison across decision options"
          sx={{
            tableLayout: 'fixed',
            borderCollapse: 'collapse',
            width: '100%',
            minWidth: 560,
            '& th, & td': { textAlign: 'left', fontSize: 13 },
          }}
        >
          <Box component="thead">
            <Box component="tr">
              <Box
                component="th"
                scope="col"
                sx={{
                  width: '22%',
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  bgcolor: 'var(--surface-subtle)',
                  p: '12px 16px',
                  verticalAlign: 'top',
                }}
              >
                <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', lineHeight: 1.2 }}>
                  Expected outcome
                </Typography>
              </Box>
              {options.map((option) => {
                const state = stateOf(option, recommendedId, selectedId, focusId);
                return (
                  <ColumnHeader key={option.id} state={state}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', lineHeight: 1.2 }}>
                        Option {option.id}
                      </Typography>
                      <Box sx={{ display: 'inline-flex', gap: 0.5, flexShrink: 0 }}>
                        {state.selected && (
                          <Chip
                            size="small"
                            icon={<Check sx={{ fontSize: 12 }} />}
                            label="Selected"
                            sx={{ height: 18, fontSize: 10, fontWeight: 700, borderRadius: 999, bgcolor: 'var(--primary)', color: '#fff', '& .MuiChip-icon': { color: '#fff' } }}
                          />
                        )}
                        {state.recommended && (
                          <Chip
                            size="small"
                            icon={<AutoAwesome sx={{ fontSize: 12, animation: `${sparkleSpin} 5s ease-in-out infinite` }} />}
                            label="AI recommended"
                            sx={{ height: 18, fontSize: 10, fontWeight: 700, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.6)', color: 'var(--ai)', '& .MuiChip-icon': { color: 'var(--ai)' } }}
                          />
                        )}
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.3, mt: 0.35, minWidth: 0, width: '100%', overflowWrap: 'anywhere' }}>
                      {option.name}
                    </Typography>
                  </ColumnHeader>
                );
              })}
            </Box>
          </Box>

          <Box component="tbody">
            {rows.map((row, rowIndex) => (
              <Box component="tr" key={row.label}>
                <Box
                  component="th"
                  scope="row"
                  sx={{
                    width: '22%',
                    position: 'sticky',
                    left: 0,
                    zIndex: 1,
                    bgcolor: rowIndex === rows.length - 1 ? 'var(--surface-subtle)' : 'background.paper',
                    color: row.label === 'Decision score' ? 'var(--primary)' : 'text.secondary',
                    p: '11px 16px',
                    fontWeight: row.label === 'Decision score' ? 700 : 600,
                    whiteSpace: 'nowrap',
                    verticalAlign: 'middle',
                    borderBottom: '1px solid',
                    borderBottomColor: 'var(--border-table)',
                  }}
                >
                  {row.label}
                </Box>
                {row.values.map((cell, i) => {
                  const option = options[i];
                  const state = stateOf(option, recommendedId, selectedId, focusId);
                  const tinted = state.recommended || state.selected;
                  return (
                    <Box
                      component="td"
                      key={option.id}
                      sx={{
                        p: '11px 16px',
                        fontWeight: state.selected ? 800 : 600,
                        color: TONE_COLOR[cell.tone] ?? 'text.primary',
                        textAlign: 'left',
                        verticalAlign: 'middle',
                        bgcolor: tinted ? 'var(--primary-lighter)' : 'background.paper',
                        borderBottom: '1px solid',
                        borderBottomColor: 'var(--border-table)',
                        borderLeft: '1px solid',
                        borderLeftColor: tinted ? 'color-mix(in srgb, var(--primary) 35%, transparent)' : 'divider',
                        whiteSpace: 'nowrap',
                        ...(state.focused ? { animation: `${focusPulse} 1.1s ease-in-out 2` } : {}),
                      }}
                    >
                      {cell.value}
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Surface>
  );
};

export default ScenarioComparison;