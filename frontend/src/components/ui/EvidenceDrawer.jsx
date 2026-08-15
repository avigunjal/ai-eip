import { Box, Button, Chip, Drawer, Typography } from '@mui/material';
import { getProject } from '../../data/service.js';
import { getSeverity, getRiskStatus } from '../../config/riskLabels.js';
import StatusBadge from '../common/StatusBadge.jsx';
import { formatRelative } from '../../config/dates.js';
import { paths } from '../../config/paths.js';

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
  const project = getProject(risk.projectId);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} slotProps={{ paper: { sx: { width: { xs: '100%', sm: 400 } } } }}>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Typography variant="h6" sx={{ fontSize: 18 }}>Risk evidence</Typography>
          <StatusBadge config={severity} />
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

        <Button variant="contained" onClick={onClose} sx={{ alignSelf: 'flex-start' }}>
          Close
        </Button>
      </Box>
    </Drawer>
  );
};

export default EvidenceDrawer;
