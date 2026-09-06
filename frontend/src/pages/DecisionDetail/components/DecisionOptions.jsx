import { Box, Button, Chip, Typography } from '@mui/material';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import Check from '@mui/icons-material/Check';
import Remove from '@mui/icons-material/Remove';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { aiGlowSoft, sparkleSpin } from '../../../config/animations.js';

/**
 * A single feasible path (spec §12/§13). "AI recommended" and the user's
 * "Selected" choice are kept as separate states — the AI recommends, the
 * human decides. Recommended stays neutral with a very subtle live AI glow;
 * the selected card gets a clean outline + check chip. They combine when the
 * user picks the recommended option. Clicking the card or the footer CTA
 * selects for comparison.
 */
const DecisionOptionCard = ({ option, selected, recommended, onSelect, onSimulate }) => (
  <Box
    role="option"
    aria-selected={selected}
    aria-label={`Option ${option.id}: ${option.name}${recommended ? ' (AI recommended)' : ''}${selected ? ' (selected)' : ''}`}
    tabIndex={0}
    onClick={onSelect}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect();
      }
    }}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      p: 2.5,
      borderRadius: 'var(--radius-card)',
      cursor: 'pointer',
      outline: '1px solid',
      outlineColor: selected ? 'var(--primary)' : recommended ? 'color-mix(in srgb, var(--ai) 45%, transparent)' : 'divider',
      boxShadow: selected ? '0 0 0 3px var(--primary-lighter)' : 'var(--shadow-card)',
      bgcolor: selected ? 'var(--primary-lighter)' : 'background.paper',
      animation: recommended && !selected ? `${aiGlowSoft} 5s ease-in-out infinite` : undefined,
      transition: 'outline-color 200ms ease, box-shadow 200ms ease, transform 200ms ease',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: recommended && !selected
          ? 'var(--shadow-float), 0 0 0 1px color-mix(in srgb, var(--ai) 30%, transparent)'
          : 'var(--shadow-float)',
      },
      '&:focus-visible': { outline: '2px solid var(--primary)', outlineOffset: '2px' },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
      <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>
        Option {option.id}
      </Typography>
      <Box sx={{ ml: 'auto', display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 0.5 }}>
        {selected && (
          <Chip
            size="small"
            icon={<Check sx={{ fontSize: 13 }} />}
            label="Selected"
            sx={{ height: 22, fontSize: 11, fontWeight: 700, borderRadius: 999, bgcolor: 'var(--primary)', color: '#fff', '& .MuiChip-icon': { color: '#fff' } }}
          />
        )}
        {recommended && (
          <Chip
            size="small"
            icon={<AutoAwesome sx={{ fontSize: 13, animation: `${sparkleSpin} 5s ease-in-out infinite` }} />}
            label="AI recommended"
            sx={{
              height: 22,
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 999,
              bgcolor: selected ? 'rgba(255,255,255,0.55)' : 'var(--ai-lighter)',
              color: 'var(--ai)',
              outline: '1px solid',
              outlineColor: 'color-mix(in srgb, var(--ai) 35%, transparent)',
              '& .MuiChip-icon': { color: 'var(--ai)' },
            }}
          />
        )}
      </Box>
    </Box>

    <Typography sx={{ fontSize: 16, fontWeight: 700, lineHeight: 1.35, mt: 1.5, overflowWrap: 'anywhere' }}>{option.name}</Typography>
    <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5, lineHeight: 1.5, overflowWrap: 'anywhere' }}>{option.description}</Typography>

    <Box sx={{ mt: 2 }}>
      <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
        Benefits
      </Typography>
      <Box component="ul" sx={{ m: 0, mt: 0.75, pl: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0.6 }}>
        {option.benefits.map((benefit) => (
          <Box component="li" key={benefit} sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-start' }}>
            <Check sx={{ fontSize: 16, mt: '2px', color: 'var(--teal)', flexShrink: 0 }} />
            <Typography sx={{ fontSize: 13, lineHeight: 1.45, overflowWrap: 'anywhere' }}>{benefit}</Typography>
          </Box>
        ))}
      </Box>
    </Box>

    <Box sx={{ mt: 1.5 }}>
      <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
        Trade-offs
      </Typography>
      <Box component="ul" sx={{ m: 0, mt: 0.75, pl: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0.6 }}>
        {option.tradeOffs.map((tradeOff) => (
          <Box component="li" key={tradeOff} sx={{ display: 'flex', gap: 0.6, alignItems: 'flex-start' }}>
            <Remove sx={{ fontSize: 16, mt: '2px', color: 'text.disabled', flexShrink: 0 }} />
            <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.45, overflowWrap: 'anywhere' }}>{tradeOff}</Typography>
          </Box>
        ))}
      </Box>
    </Box>

    <Box sx={{ mt: 'auto', pt: 2 }}>
      <Button
        size="small"
        endIcon={<ArrowForward />}
        onClick={(e) => {
          e.stopPropagation();
          onSimulate();
        }}
        sx={{ textTransform: 'none', fontWeight: 600, '&:focus-visible': { outline: '2px solid var(--primary)', outlineOffset: 2 } }}
      >
        View simulation
      </Button>
    </Box>
  </Box>
);

/**
 * Section 03 — Possible paths forward (spec §11): the feasible options in a
 * side-by-side grid that stacks on small screens. `selectedId` may be null —
 * no option is user-confirmed until the human picks one.
 */
const DecisionOptions = ({ options, selectedId, recommendedId, onSelect, onSimulate }) => (
  <Box role="listbox" aria-label="Decision options" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
    {options.map((option) => (
      <DecisionOptionCard
        key={option.id}
        option={option}
        selected={selectedId === option.id}
        recommended={option.id === recommendedId}
        onSelect={() => onSelect(option.id)}
        onSimulate={() => onSimulate(option.id)}
      />
    ))}
  </Box>
);

export default DecisionOptions;