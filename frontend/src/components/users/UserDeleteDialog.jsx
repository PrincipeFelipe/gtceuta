import React from 'react';
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  Typography,
  CircularProgress
} from '@mui/material';

const UserDeleteDialog = ({ open, onClose, onConfirm, userName, isDeleting }) => {
  return (
    <Dialog
      open={open}
      onClose={!isDeleting ? onClose : undefined}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        sx: {
          backgroundColor: 'background.paper',
          borderRadius: 2,
          minWidth: { xs: '90%', sm: '500px' }
        }
      }}
    >
      <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}>
        <Typography variant="h6" component="span" sx={{ color: 'error.main', fontWeight: 'bold' }}>
          Eliminar usuario
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description" sx={{ color: 'text.secondary' }}>
          ¿Estás seguro de que deseas eliminar al usuario <strong>{userName}</strong>? Esta acción no se puede deshacer.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          color="inherit"
          disabled={isDeleting}
        >
          Cancelar
        </Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          variant="contained" 
          disableElevation
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isDeleting ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDeleteDialog;