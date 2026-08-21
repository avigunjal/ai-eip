import { Box, Button, Chip, Drawer, Typography } from '@mui/material';
import { getSeverity, getRiskStatus } from '../../config/riskLabels.js';
import StatusBadge from '../common/StatusBadge.jsx';
import SparkleIcon from './SparkleIcon.jsx';
import { formatRelative } from '../../config/dates.js';
import { paths } from '../../config/paths.js';
import { TOPBAR_HEIGHT } from '../../config/constants.js';

/**
 * Right-side drawer that shows the evidence (signals) behind a risk, plus
 * confidence / probability / impact and the linked project. Opened from the
 * Risks register and ProjectDetail risk lists.
 *
 * REMAINING (extend later):
 *  - link each signal's `url` to a real external source
 *  - "Add evidence" action
 *  - workflow actions (assign / mitigate) inside the drawer
 */
const EvidenceDrawer = ({ open, onClose, risk }) => {
  if (!risk) return null;
  const severity = getSeverity(risk.severity);
  const status = getRiskStatus(risk.status);
  const project = risk.projectName ? { id: risk.projectId, name: risk.projectName } : null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        root: { sx: { zIndex: (theme) => theme.zIndex.drawer + 2 } },
        paper: {
          sx: {
            width: { xs: '100%', sm: 560 },
            top: `${TOPBAR_HEIGHT}px`,
            height: `calc(100% - ${TOPBAR_HEIGHT}px)`,
          },
        },
      }}
    >
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Typography variant="h6" sx={{ fontSize: 18 }}>Risk evidence</Typography>
          <StatusBadge config={severity} pulse={risk.severity === 'critical'} />
        </Box>

        <Typography sx={{ fontWeight: 600 }}>{risk.title}</Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <StatusBadge config={status} />
          {project && (
            <Chip component="a" href={paths.project(project.id)} label={project.name} variant="outlined" size="small" />
          )}
        </Box>

        {/* Metrics */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
          {[
            ['Confidence', `${risk.confidence}%`],
            ['Probability', `${risk.probability}%`],
            ['Impact', `${risk.impact}%`],
          ].map(([k, v]) => (
            <Box key={k} sx={{ p: 1.5, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-control)' }}>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{k}</Typography>
              <Typography sx={{ fontWeight: 700 }}>{v}</Typography>
            </Box>
          ))}
        </Box>

        {/* Signals / evidence */}
        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Supporting signals ({risk.signals?.length ?? 0})</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {(risk.signals ?? []).map((sig) => (
            <Box
              key={sig.id}
              sx={{ p: 1.5, outline: '1px solid', outlineColor: 'divider', borderRadius: 'var(--radius-control)' }}
            >
              <Typography sx={{ fontSize: 14 }}>{sig.label}</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                {sig.source} · {formatRelative(sig.occurredAt)}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Derivation sources — where the signal data comes from. */}
        {(() => {
          const sources = [...new Set((risk.signals ?? []).map((s) => s.source).filter(Boolean))];
          return sources.length > 0 ? (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              <SparkleIcon sx={{ fontSize: 14, color: 'var(--ai)', flexShrink: 0 }} />
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                Derived from{' '}
                <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {sources.join(' · ')}
                </Box>
              </Typography>
            </Box>
          ) : null;
        })()}

        {/* Why it matters / impact / mitigation / owner */}
        {[
          ['Why this matters', risk.whyThisMatters],
          ['Expected impact', risk.expectedImpact],
          ['Suggested mitigation', risk.suggestedMitigation],
          ['Owner', risk.ownerName],
        ].filter(([, value]) => value).map(([label, value]) => (
          <Box key={label}>
            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{label}</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25 }}>{value}</Typography>
          </Box>
        ))}

        <Button variant="contained" onClick={onClose} sx={{ alignSelf: 'flex-start' }}>
          Close
        </Button>
      </Box>
    </Drawer>
  );
};

export default EvidenceDrawer;
