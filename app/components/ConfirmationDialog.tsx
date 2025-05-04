import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Avatar
} from '@mui/material';
import {
  Warning as WarningIcon,
  Close as CloseIcon
} from '@mui/icons-material';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  onConfirm,
  onCancel,
  type = 'warning'
}) => {
  // Set colors based on type
  const getColor = () => {
    switch(type) {
      case 'danger': return '#e57373';
      case 'info': return '#A5C7E4';
      case 'warning':
      default: return '#ffb74d';
    }
  };
  
  const color = getColor();
  
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          backgroundColor: 'var(--paper-color)',
          boxShadow: '0 2px 10px rgba(127, 120, 210, 0.15)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '16px 24px',
        bgcolor: `${color}15`,
        borderBottom: '1px solid rgba(127, 120, 210, 0.1)',
        color: 'rgb(var(--foreground-rgb))'
      }}>
        <Avatar 
          sx={{ 
            bgcolor: color,
            mr: 1.5,
            width: 32,
            height: 32 
          }}
        >
          <WarningIcon fontSize="small" />
        </Avatar>
        <Typography variant="h6" sx={{ flex: 1, fontWeight: 500 }}>
          {title}
        </Typography>
        <IconButton onClick={onCancel} edge="end" size="small" sx={{ color: 'var(--dark-gray)' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Typography variant="body1">
          {message}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={onCancel} 
          variant="outlined"
          sx={{ 
            color: 'var(--dark-gray)',
            borderColor: 'rgba(127, 120, 210, 0.2)',
            '&:hover': {
              borderColor: 'rgba(127, 120, 210, 0.3)',
              backgroundColor: 'rgba(127, 120, 210, 0.05)'
            }
          }}
        >
          {cancelText}
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained"
          sx={{ 
            bgcolor: color,
            '&:hover': {
              bgcolor: type === 'danger' ? '#d32f2f' : (type === 'info' ? '#84A7C4' : '#f57c00')  
            }
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog; 