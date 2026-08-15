import { Alert, Button, Snackbar, Stack } from '@mui/material';
import { useToastStore } from '../../store/toastStore.js';

/**
 * Global toast host. Renders undoable toasts from the zustand toast store.
 * The optional `action` is run when "Undo" is pressed, then the toast closes.
 */
const Toaster = () => {
  const { toasts, dismiss } = useToastStore();

  return (
    <Stack spacing={2} sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 3000 }}>
      {toasts.map((toast) => (
        <Snackbar
          key={toast.id}
          open
          autoHideDuration={toast.duration ?? 4000}
          onClose={() => dismiss(toast.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={toast.severity}
            variant="filled"
            onClose={() => dismiss(toast.id)}
            action={
              toast.actionLabel ? (
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => {
                    toast.action?.();
                    dismiss(toast.id);
                  }}
                >
                  {toast.actionLabel}
                </Button>
              ) : null
            }
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
};

export default Toaster;
