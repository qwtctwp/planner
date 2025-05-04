import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon 
} from '@mui/icons-material';
import { Lesson } from '../types';

interface EventContextMenuProps {
  open: boolean;
  anchorPosition: { top: number; left: number } | null;
  selectedLesson: Lesson | null;
  onClose: () => void;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lesson: Lesson) => void;
  onAssignments: (lesson: Lesson) => void;
}

const EventContextMenu: React.FC<EventContextMenuProps> = ({
  open,
  anchorPosition,
  selectedLesson,
  onClose,
  onEdit,
  onDelete,
  onAssignments
}) => {
  if (!selectedLesson) return null;

  return (
    <Menu
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition || undefined}
      sx={{
        '& .MuiPaper-root': {
          borderRadius: 1.5,
          boxShadow: '0 2px 10px rgba(165, 199, 228, 0.15)',
          backgroundColor: 'var(--paper-color)',
          backgroundImage: 'none',
          border: '1px solid rgba(165, 199, 228, 0.08)',
        }
      }}
    >
      <MenuItem 
        onClick={() => {
          onEdit(selectedLesson);
          onClose();
        }}
        sx={{ 
          color: 'rgb(var(--foreground-rgb))',
          '&:hover': { backgroundColor: 'rgba(165, 199, 228, 0.08)' } 
        }}
      >
        <ListItemIcon>
          <EditIcon fontSize="small" sx={{ color: 'var(--primary-color)' }} />
        </ListItemIcon>
        <ListItemText>Редактировать событие</ListItemText>
      </MenuItem>
      
      <MenuItem 
        onClick={() => {
          onAssignments(selectedLesson);
          onClose();
        }}
        sx={{ 
          color: 'rgb(var(--foreground-rgb))',
          '&:hover': { backgroundColor: 'rgba(165, 199, 228, 0.08)' } 
        }}
      >
        <ListItemIcon>
          <AssignmentIcon fontSize="small" sx={{ color: 'var(--primary-color)' }} />
        </ListItemIcon>
        <ListItemText>Задания</ListItemText>
      </MenuItem>
      
      <Divider sx={{ my: 0.5, borderColor: 'rgba(165, 199, 228, 0.15)' }} />
      
      <MenuItem 
        onClick={() => {
          onDelete(selectedLesson);
          onClose();
        }}
        sx={{ 
          color: '#e57373',
          '&:hover': { backgroundColor: 'rgba(229, 115, 115, 0.08)' } 
        }}
      >
        <ListItemIcon>
          <DeleteIcon fontSize="small" sx={{ color: '#e57373' }} />
        </ListItemIcon>
        <ListItemText>Удалить</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default EventContextMenu; 