'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
  TextField,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Assignment } from '../types';

interface AssignmentDetailsProps {
  assignment: Assignment;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
}

export default function AssignmentDetails({
  assignment,
  open,
  onClose,
  onEdit,
  onDelete,
  onToggleComplete,
}: AssignmentDetailsProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div">
            {assignment.title}
          </Typography>
          <Box>
            <IconButton onClick={onEdit} size="small" sx={{ mr: 1 }}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={onDelete} size="small" color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={<AccessTimeIcon />}
            label={`Срок сдачи: ${format(new Date(assignment.dueDate), 'dd MMMM yyyy HH:mm', { locale: ru })}`}
            color={new Date(assignment.dueDate) < new Date() ? 'error' : 'primary'}
            sx={{ mb: 2 }}
          />
          <Chip
            icon={<AssignmentIcon />}
            label={assignment.completed ? 'Выполнено' : 'Не выполнено'}
            color={assignment.completed ? 'success' : 'default'}
            sx={{ ml: 1 }}
          />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" gutterBottom>
          Описание:
        </Typography>
        <TextField
          multiline
          fullWidth
          rows={4}
          value={assignment.description}
          InputProps={{
            readOnly: true,
          }}
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
        <Button
          onClick={onToggleComplete}
          variant="contained"
          color={assignment.completed ? 'error' : 'success'}
        >
          {assignment.completed ? 'Отметить как невыполненное' : 'Отметить как выполненное'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 