'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import KanbanBoardFixed from '../KanbanBoardFixed';
import { useAuth } from '../contexts/AuthContext';
import { 
  getCategoriesForUser, 
  getAssignmentsForUser,
  updateAssignment,
  addAssignment,
  deleteAssignment
} from '../lib/api';
import { Category, Assignment } from '../types';
import { useRouter } from 'next/navigation';

export default function FixedPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch data on component mount
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        try {
          console.log('Loading data for user:', user.id);
          const userCategories = await getCategoriesForUser(user.id);
          const userAssignments = await getAssignmentsForUser(user.id);
          
          console.log('Loaded categories:', userCategories);
          console.log('Loaded assignments:', userAssignments);
          
          setCategories(userCategories);
          setAssignments(userAssignments);
          setLoading(false);
        } catch (error) {
          console.error('Error loading data:', error);
          setLoading(false);
        }
      };
      
      loadData();
    }
  }, [user]);

  useEffect(() => {
    // Redirect to dashboard
    router.push('/dashboard');
  }, [router]);

  const handleUpdateAssignment = async (assignmentId: string, data: Partial<Assignment>) => {
    if (!user) return;
    
    try {
      console.log('Updating assignment:', assignmentId, data);
      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) {
        console.error('Assignment not found:', assignmentId);
        return;
      }
      
      const updatedAssignment = { ...assignment, ...data };
      
      // First update local state to give immediate feedback
      setAssignments(prev => prev.map(a => a.id === assignmentId ? updatedAssignment : a));
      
      // Then update in the backend
      const result = await updateAssignment(assignmentId, data);
      console.log('Update result:', result);
      
      // If there was an error or the result is different from what we expected, update again with server data
      if (result) {
        setAssignments(prev => prev.map(a => a.id === assignmentId ? result : a));
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      // Revert to original state in case of error
      const originalAssignments = [...assignments];
      setAssignments(originalAssignments);
    }
  };

  const handleAddAssignment = async (assignmentData: Omit<Assignment, 'id' | 'completed'>) => {
    if (!user) return;
    
    try {
      console.log('Adding assignment:', assignmentData);
      const newAssignmentData = {
        ...assignmentData,
        completed: assignmentData.status === 'done'
      };
      
      const assignmentId = await addAssignment(user.id, newAssignmentData);
      console.log('New assignment ID:', assignmentId);
      
      const newAssignment: Assignment = {
        ...newAssignmentData,
        id: assignmentId,
        completed: newAssignmentData.status === 'done'
      };
      
      setAssignments(prev => [...prev, newAssignment]);
    } catch (error) {
      console.error('Error adding assignment:', error);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!user) return;
    
    try {
      console.log('Deleting assignment:', assignmentId);
      // Optimistically update UI
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      
      // Then delete on the backend
      await deleteAssignment(assignmentId);
    } catch (error) {
      console.error('Error deleting assignment:', error);
      // If there was an error, reload assignments
      if (user) {
        const userAssignments = await getAssignmentsForUser(user.id);
        setAssignments(userAssignments);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return null;
} 