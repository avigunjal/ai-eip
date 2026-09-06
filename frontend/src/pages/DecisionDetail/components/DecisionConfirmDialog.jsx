import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import RecordVoiceOver from '@mui/icons-material/RecordVoiceOver';
import FlagOutlined from '@mui/icons-material/FlagOutlined';

/**
 * Final confirmation before recording a decision (spec §21): shows the exact
 * option being recorded and states that this surfaces as "Action planned"
 * in the Decision Inbox. Recording is one atomic store write.
 */
const DecisionConfirmDialog = ({ open, decision, selected, recorded, onCancel, onConfirm }) => {
  // The dialog can only be opened after a path is selected — but MUI renders
  // children even while closed. Guard against a null `selected` (nothing chosen
  // yet) so the page never throws while the dialog is simply mounted.
  if (!selected) return null;

  return (
    <Dialog
    open={open}
    onClose={onCancel}
    fullWidth
    maxWidth="sm"
    PaperProps={{ sx: { borderRadius: 'var(--radius-card)' } }}
  >
    <DialogTitle sx={{ px: { xs: 3, sm: 4 }, pt: { xs: 3, sm: 3.5 }, pb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-control)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'var(--primary-lighter)',
            color: 'var(--primary)',
            flexShrink: 0,
          }}
        >
          <FlagOutlined sx={{ fontSize: 22 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 19, fontWeight: 700, lineHeight: 1.25 }}>
            {recorded ? 'Update recorded decision' : 'Record this decision?'}
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25, lineHeight: 1.4 }}>
            {decision.context}
          </Typography>
        </Box>
      </Box>
    </DialogTitle>

    <DialogContent sx={{ px: { xs: 3, sm: 4 }, pt: 0, pb: 1 }}>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.5 }}>
        You are recording:
      </Typography>
      <Box
        sx={{
          mt: 1,
          p: 2,
          borderRadius: 'var(--radius-control)',
          bgcolor: 'var(--surface-subtle)',
          outline: '1px solid',
          outlineColor: 'divider',
        }}
      >
        <Typography sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>
          {selected.name}
          <Box component="span" sx={{ fontWeight: 500, color: 'text.secondary' }}>
            {'  '}(Option {selected.id})
          </Box>
        </Typography>
      </Box>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 1.5, lineHeight: 1.5 }}>
        This will mark the decision as Action planned for this session. You can update the record later from this workspace.
      </Typography>
    </DialogContent>

    <DialogActions sx={{ px: { xs: 3, sm: 4 }, pb: 3, pt: 1.5, gap: 1.5 }}>
      <Button size="large" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        size="large"
        variant="contained"
        startIcon={<RecordVoiceOver />}
        onClick={onConfirm}
        sx={{ px: 3, textTransform: 'none', fontWeight: 700 }}
      >
        {recorded ? 'Update decision' : 'Record decision'}
      </Button>
    </DialogActions>
    </Dialog>
  );
};

export default DecisionConfirmDialog;