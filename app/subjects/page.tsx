'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  CircularProgress,
  Button,
  Chip,
  Fab,
  Zoom,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  Slide,
  SwipeableDrawer,
  LinearProgress,
  Tooltip,
  Fade,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  School as SchoolIcon,
  Add as AddIcon,
  FlipToFront as FlipIcon,
  BookmarkBorder as BookmarkIcon,
  Star as StarIcon,
  Collections as TopicsIcon,
  Topic as TopicIcon,
  ArrowBack as ArrowBackIcon,
  Slideshow as SlideshowIcon,
  Close as CloseIcon,
  ArrowForward as NextIcon,
  ArrowBack as PrevIcon,
  Check as CorrectIcon,
  Clear as WrongIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Replay as ReplayIcon,
  BarChart as StatsIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import SideBar from '../components/SideBar';
import { useAuth } from '../contexts/AuthContext';
import { 
  getCategoriesForUser,
  getFlashcardTopicsForUser,
  getFlashcardsForUser,
  addFlashcardTopic,
  updateFlashcardTopic,
  deleteFlashcardTopic,
  addFlashcard,
  updateFlashcard,
  toggleFlashcardFavorite,
  deleteFlashcard
} from '../lib/api';
import { Category, Flashcard, FlashcardTopic } from '../types';

// Заменяю sampleTopics и sampleFlashcards на пустые массивы
const sampleTopics: FlashcardTopic[] = [];
const sampleFlashcards: Flashcard[] = [];

export default function FlashcardsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const drawerWidth = 240;
  const { user } = useAuth();
  
  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<FlashcardTopic[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flippedCards, setFlippedCards] = useState<{[key: string]: boolean}>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  
  // View states
  const [viewMode, setViewMode] = useState<'topics' | 'cards'>('topics');
  const [selectedTopic, setSelectedTopic] = useState<FlashcardTopic | null>(null);
  
  // Dialog states
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editingTopic, setEditingTopic] = useState<FlashcardTopic | null>(null);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [topicToDelete, setTopicToDelete] = useState<FlashcardTopic | null>(null);
  const [cardToDelete, setCardToDelete] = useState<Flashcard | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteType, setDeleteType] = useState<'topic' | 'card' | ''>('');
  
  // Menu state
  const [topicMenuAnchorEl, setTopicMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [cardMenuAnchorEl, setCardMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTargetId, setMenuTargetId] = useState<string>('');
  
  // Form state
  const [newTopicData, setNewTopicData] = useState({
    title: '',
    description: '',
    categoryId: ''
  });
  const [newCardData, setNewCardData] = useState({
    front: '',
    back: '',
    topicId: '',
    categoryId: ''
  });
  
  // Slideshow state
  const [slideshowMode, setSlideshowMode] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<{[key: string]: 'correct' | 'wrong' | null}>({});
  const [slideshowComplete, setSlideshowComplete] = useState(false);
  
  // Fetch data on component mount
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        try {
          setLoading(true);
          
          // Load categories
          const userCategories = await getCategoriesForUser(user.id);
          
          // Фильтруем только категории с типом 'subject'
          const subjectCategories = userCategories.filter(cat => cat.type === 'subject');
          setCategories(subjectCategories);
          
          // Load flashcard topics
          const userTopics = await getFlashcardTopicsForUser(user.id);
          setTopics(userTopics);
          
          // Load flashcards
          const userFlashcards = await getFlashcardsForUser(user.id);
          setFlashcards(userFlashcards);
          
          setLoading(false);
        } catch (error) {
          console.error('Ошибка при загрузке данных:', error);
          setLoading(false);
        }
      };
      
      loadData();
    } else {
      // Для демо устанавливаем пустые категории
      setCategories([]);
      setTopics([]);
      setFlashcards([]);
      setLoading(false);
    }
  }, [user]);

  // Card handlers
  const handleFlipCard = (id: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const card = flashcards.find(c => c.id === id);
      if (!card) return;
      
      // Оптимистическое обновление UI
      setFlashcards(prev => 
        prev.map(card => 
          card.id === id ? {...card, favorite: !card.favorite} : card
        )
      );
      
      // Вызов API для сохранения изменений
      await toggleFlashcardFavorite(id, !card.favorite);
    } catch (error) {
      console.error('Ошибка при обновлении избранного:', error);
      // Откат изменений в случае ошибки
      setFlashcards(prev => 
        prev.map(card => 
          card.id === id ? {...card, favorite: card.favorite} : card
        )
      );
    }
  };

  // Category and topic handlers
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const handleTopicSelect = (topic: FlashcardTopic) => {
    setSelectedTopic(topic);
    setViewMode('cards');
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setViewMode('topics');
  };

  // Dialog handlers
  const handleOpenTopicDialog = () => {
    setEditMode(false);
    setEditingTopic(null);
    // Автоматически выбираем первую категорию, если она есть
    const defaultCategoryId = categories.length > 0 ? categories[0].id : '';
    setNewTopicData({
      title: '',
      description: '',
      categoryId: defaultCategoryId
    });
    setTopicDialogOpen(true);
  };

  const handleCloseTopicDialog = () => {
    setTopicDialogOpen(false);
    setEditMode(false);
    setEditingTopic(null);
    setNewTopicData({
      title: '',
      description: '',
      categoryId: ''
    });
  };

  const handleOpenCardDialog = () => {
    setEditMode(false);
    setEditingCard(null);
    setNewCardData({
      front: '',
      back: '',
      topicId: selectedTopic?.id || '',
      categoryId: selectedTopic?.categoryId || ''
    });
    setCardDialogOpen(true);
  };

  const handleCloseCardDialog = () => {
    setCardDialogOpen(false);
    setEditMode(false);
    setEditingCard(null);
    setNewCardData({
      front: '',
      back: '',
      topicId: selectedTopic?.id || '',
      categoryId: selectedTopic?.categoryId || ''
    });
  };

  // Menu handlers
  const handleOpenTopicMenu = (event: React.MouseEvent<HTMLElement>, topicId: string) => {
    event.stopPropagation();
    setTopicMenuAnchorEl(event.currentTarget);
    setMenuTargetId(topicId);
  };

  const handleCloseTopicMenu = () => {
    setTopicMenuAnchorEl(null);
    setMenuTargetId('');
  };

  const handleOpenCardMenu = (event: React.MouseEvent<HTMLElement>, cardId: string) => {
    event.stopPropagation();
    setCardMenuAnchorEl(event.currentTarget);
    setMenuTargetId(cardId);
  };

  const handleCloseCardMenu = () => {
    setCardMenuAnchorEl(null);
    setMenuTargetId('');
  };
  
  // Edit handlers
  const handleEditTopic = (topic: FlashcardTopic) => {
    setEditMode(true);
    setEditingTopic(topic);
    
    // При редактировании сохраняем существующую категорию
    setNewTopicData({
      title: topic.title,
      description: topic.description || '',
      categoryId: topic.categoryId
    });
    
    setTopicDialogOpen(true);
    handleCloseTopicMenu();
  };
  
  const handleEditCard = (card: Flashcard) => {
    setEditingCard(card);
    setEditMode(true);
    setNewCardData({
      front: card.front,
      back: card.back,
      topicId: card.topicId,
      categoryId: card.categoryId
    });
    setCardDialogOpen(true);
  };
  
  // Delete handlers
  const handleDeleteRequest = (type: 'topic' | 'card', id: string) => {
    if (type === 'topic') {
      const topic = topics.find(t => t.id === id);
      if (topic) {
        setTopicToDelete(topic);
        setDeleteType('topic');
        setDeleteDialogOpen(true);
      }
    } else if (type === 'card') {
      const card = flashcards.find(c => c.id === id);
      if (card) {
        setCardToDelete(card);
        setDeleteType('card');
        setDeleteDialogOpen(true);
      }
    }
    handleCloseTopicMenu();
    handleCloseCardMenu();
  };
  
  const handleConfirmDelete = async () => {
    try {
      if (deleteType === 'topic' && topicToDelete) {
        // Вызываем API для удаления темы
        await deleteFlashcardTopic(topicToDelete.id);
        
        // Обновляем локальное состояние
        setTopics(prev => prev.filter(t => t.id !== topicToDelete.id));
        setFlashcards(prev => prev.filter(c => c.topicId !== topicToDelete.id));
        
        // If we're viewing cards of the deleted topic, go back to topics
        if (selectedTopic && selectedTopic.id === topicToDelete.id) {
          setSelectedTopic(null);
          setViewMode('topics');
        }
      } else if (deleteType === 'card' && cardToDelete) {
        // Вызываем API для удаления карточки
        await deleteFlashcard(cardToDelete.id);
        
        // Обновляем локальное состояние
        setFlashcards(prev => prev.filter(c => c.id !== cardToDelete.id));
        
        // Update card count in the topic
        if (cardToDelete.topicId) {
          setTopics(prev => 
            prev.map(topic => 
              topic.id === cardToDelete.topicId 
                ? { ...topic, cardsCount: topic.cardsCount - 1 } 
                : topic
            )
          );
        }
      }
    } catch (error) {
      console.error('Ошибка при удалении:', error);
    } finally {
      setDeleteDialogOpen(false);
      setTopicToDelete(null);
      setCardToDelete(null);
      setDeleteType('');
    }
  };
  
  // Add/Edit Topic handler
  const handleAddOrUpdateTopic = async () => {
    if (!newTopicData.title || !user) return;
    
    try {
      // Если categoryId не указан, берем первую категорию или используем дефолт
      let effectiveCategoryId = newTopicData.categoryId;
      let effectiveColor = '#84A7C4'; // дефолтный цвет
      
      if (!effectiveCategoryId && categories.length > 0) {
        effectiveCategoryId = categories[0].id;
        effectiveColor = categories[0].color;
      }
      
      const category = categories.find(c => c.id === effectiveCategoryId);
      if (category) {
        effectiveColor = category.color;
      }
      
      if (editMode && editingTopic) {
        // Update existing topic
        await updateFlashcardTopic(editingTopic.id, {
          title: newTopicData.title,
          description: newTopicData.description,
          categoryId: effectiveCategoryId,
          color: effectiveColor,
        });
        
        const updatedTopic: FlashcardTopic = {
          ...editingTopic,
          title: newTopicData.title,
          description: newTopicData.description,
          categoryId: effectiveCategoryId,
          color: effectiveColor,
        };
        
        // Обновляем локальное состояние
        setTopics(prev => prev.map(t => t.id === editingTopic.id ? updatedTopic : t));
        
        // Update the selected topic if it's the one being edited
        if (selectedTopic && selectedTopic.id === editingTopic.id) {
          setSelectedTopic(updatedTopic);
        }
      } else {
        // Add new topic
        const topicId = await addFlashcardTopic(user.id, {
          title: newTopicData.title,
          description: newTopicData.description,
          categoryId: effectiveCategoryId,
          color: effectiveColor,
        });
        
        const newTopic: FlashcardTopic = {
          id: topicId,
          title: newTopicData.title,
          description: newTopicData.description,
          categoryId: effectiveCategoryId,
          color: effectiveColor,
          createdAt: new Date().toISOString(),
          cardsCount: 0
        };
        
        // Обновляем локальное состояние
        setTopics(prev => [...prev, newTopic]);
      }
    } catch (error) {
      console.error('Ошибка при сохранении темы:', error);
    } finally {
      handleCloseTopicDialog();
    }
  };
  
  // Add/Edit Card handler
  const handleAddOrUpdateCard = async () => {
    if (!newCardData.front || !newCardData.back || !newCardData.topicId || !user) return;
    
    try {
      if (editMode && editingCard) {
        // Update existing card
        await updateFlashcard(editingCard.id, {
          front: newCardData.front,
          back: newCardData.back,
          topicId: newCardData.topicId,
          categoryId: newCardData.categoryId,
        });
        
        const updatedCard: Flashcard = {
          ...editingCard,
          front: newCardData.front,
          back: newCardData.back,
          topicId: newCardData.topicId,
          categoryId: newCardData.categoryId,
        };
        
        // Обновляем локальное состояние
        setFlashcards(prev => prev.map(c => c.id === editingCard.id ? updatedCard : c));
        
        // If moving to different topic, update counts
        if (editingCard.topicId !== newCardData.topicId) {
          setTopics(prev => 
            prev.map(topic => {
              if (topic.id === editingCard.topicId) {
                return { ...topic, cardsCount: topic.cardsCount - 1 };
              }
              if (topic.id === newCardData.topicId) {
                return { ...topic, cardsCount: topic.cardsCount + 1 };
              }
              return topic;
            })
          );
        }
      } else {
        // Add new card
        const cardId = await addFlashcard(user.id, {
          front: newCardData.front,
          back: newCardData.back,
          topicId: newCardData.topicId,
          categoryId: newCardData.categoryId,
          favorite: false
        });
        
        const newCard: Flashcard = {
          id: cardId,
          front: newCardData.front,
          back: newCardData.back,
          topicId: newCardData.topicId,
          categoryId: newCardData.categoryId,
          favorite: false,
          createdAt: new Date().toISOString()
        };
        
        // Обновляем локальное состояние
        setFlashcards(prev => [...prev, newCard]);
        
        // Update card count in the topic
        setTopics(prev => 
          prev.map(topic => 
            topic.id === newCardData.topicId 
              ? { ...topic, cardsCount: topic.cardsCount + 1 } 
              : topic
          )
        );
      }
    } catch (error) {
      console.error('Ошибка при сохранении карточки:', error);
    } finally {
      handleCloseCardDialog();
    }
  };

  // Filter topics by category
  const filteredTopics = topics.filter(topic => {
    if (selectedCategory && topic.categoryId !== selectedCategory) return false;
    return true;
  });

  // Filter cards by topic and favorites
  const filteredFlashcards = flashcards.filter(card => {
    if (selectedTopic && card.topicId !== selectedTopic.id) return false;
    if (showFavorites && !card.favorite) return false;
    return true;
  });

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setFullscreen(false);
      }
    }
  };

  // Start slideshow with current filtered cards
  const startSlideshow = () => {
    setSlideshowMode(true);
    setCurrentSlideIndex(0);
    setShowAnswer(false);
    setSlideshowComplete(false);
    // Reset review status for all cards in the slideshow
    const initialReviewState: {[key: string]: 'correct' | 'wrong' | null} = {};
    filteredFlashcards.forEach(card => {
      initialReviewState[card.id] = null;
    });
    setReviewedCards(initialReviewState);
  };

  // Close slideshow
  const closeSlideshow = () => {
    setSlideshowMode(false);
    setShowAnswer(false);
    setSlideshowComplete(false);
    
    // If in fullscreen, exit it
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  // Toggle answer visibility in slideshow
  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  // Navigate to next card
  const goToNextCard = () => {
    if (currentSlideIndex < filteredFlashcards.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
      setShowAnswer(false);
    } else {
      // We're at the last card, mark slideshow as complete
      setSlideshowComplete(true);
    }
  };

  // Navigate to previous card
  const goToPrevCard = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
      setShowAnswer(false);
    }
  };

  // Mark current card as correct or wrong
  const markCard = (status: 'correct' | 'wrong') => {
    const currentCard = filteredFlashcards[currentSlideIndex];
    if (currentCard) {
      setReviewedCards(prev => ({
        ...prev,
        [currentCard.id]: status
      }));
      
      // Automatically go to next card after marking
      setTimeout(() => {
        if (currentSlideIndex < filteredFlashcards.length - 1) {
          goToNextCard();
        } else {
          // We're at the last card, mark slideshow as complete
          setSlideshowComplete(true);
        }
      }, 500);
    }
  };

  // Calculate slideshow progress
  const calculateProgress = () => {
    if (filteredFlashcards.length === 0) return 0;
    return ((currentSlideIndex + 1) / filteredFlashcards.length) * 100;
  };

  // Get current card for slideshow
  const currentCard = filteredFlashcards[currentSlideIndex] || null;

  // Restart slideshow
  const restartSlideshow = () => {
    setCurrentSlideIndex(0);
    setShowAnswer(false);
    setSlideshowComplete(false);
    // Reset only wrong cards
    const newReviewState = {...reviewedCards};
    Object.keys(newReviewState).forEach(cardId => {
      if (newReviewState[cardId] === 'wrong') {
        newReviewState[cardId] = null;
      }
    });
    setReviewedCards(newReviewState);
  };

  // Review only wrong cards
  const reviewWrongCards = () => {
    // Create a list of cards that were marked as wrong
    const wrongCardIndices: number[] = [];
    filteredFlashcards.forEach((card, index) => {
      if (reviewedCards[card.id] === 'wrong') {
        wrongCardIndices.push(index);
      }
    });
    
    if (wrongCardIndices.length > 0) {
      // Start with the first wrong card
      setCurrentSlideIndex(wrongCardIndices[0]);
      setSlideshowComplete(false);
      setShowAnswer(false);
      
      // Reset review status only for wrong cards
      const newReviewState = {...reviewedCards};
      Object.keys(newReviewState).forEach(cardId => {
        if (newReviewState[cardId] === 'wrong') {
          newReviewState[cardId] = null;
        }
      });
      setReviewedCards(newReviewState);
    }
  };

  // Calculate statistics for completion screen
  const calculateStats = () => {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    
    filteredFlashcards.forEach(card => {
      const status = reviewedCards[card.id];
      if (status === 'correct') correct++;
      else if (status === 'wrong') wrong++;
      else skipped++;
    });
    
    return { correct, wrong, skipped, total: filteredFlashcards.length };
  };

  // Check if there are any wrong cards to review
  const hasWrongCards = () => {
    return filteredFlashcards.some(card => reviewedCards[card.id] === 'wrong');
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: 'background.default',
    }}>
      {/* AppBar with the header */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h5" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'primary.main'
            }}
          >
            Личный планер
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Side drawer */}
      <SideBar
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={drawerWidth}
      />

      {/* Main content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          p: 3, 
          pt: 0,
          overflow: 'auto',
          marginTop: '64px', // Height of the AppBar
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 64px)'
        }}
      >
        {/* Page title with back button when viewing cards */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {viewMode === 'cards' && selectedTopic && (
              <IconButton 
                onClick={handleBackToTopics}
                sx={{ 
                  color: 'var(--primary-color-dark)',
                  bgcolor: 'rgba(165, 199, 228, 0.08)',
                  mr: 1
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                letterSpacing: '-0.025em'
              }}
            >
              {viewMode === 'topics' 
                ? 'Карточки-запоминалки' 
                : selectedTopic?.title || 'Карточки по теме'}
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={viewMode === 'topics' ? handleOpenTopicDialog : handleOpenCardDialog}
            sx={{ 
              bgcolor: 'var(--primary-color)',
              '&:hover': { bgcolor: 'var(--primary-color-dark)' },
              textTransform: 'none',
              borderRadius: 1
            }}
          >
            {viewMode === 'topics' ? 'Новая тема' : 'Новая карточка'}
          </Button>
        </Box>

        {/* Topic description when viewing cards */}
        {viewMode === 'cards' && selectedTopic?.description && (
          <Paper 
            sx={{ 
              p: 2, 
              mb: 3, 
              borderRadius: 2,
              bgcolor: 'rgba(165, 199, 228, 0.05)',
              borderLeft: `4px solid ${selectedTopic.color || 'var(--primary-color)'}`,
              boxShadow: 'none'
            }}
          >
            <Typography variant="body1" color="text.secondary">
              {selectedTopic.description}
            </Typography>
          </Paper>
        )}

        {/* Filters row - only show in cards view */}
        {viewMode === 'cards' && (
          <Box sx={{ 
            mb: 3, 
            display: 'flex', 
            gap: 1, 
            flexWrap: 'wrap',
            justifyContent: 'space-between' 
          }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                icon={<StarIcon />} 
                label="Избранные" 
                clickable
                onClick={() => setShowFavorites(!showFavorites)}
                color={showFavorites ? "primary" : "default"}
                sx={{ 
                  px: 1,
                  borderRadius: 2,
                  fontWeight: 500
                }}
              />
            </Box>
            
            {/* Slideshow button */}
            {filteredFlashcards.length > 0 && (
              <Button
                variant="outlined"
                startIcon={<SlideshowIcon />}
                onClick={startSlideshow}
                sx={{
                  borderColor: 'var(--primary-color-light)',
                  color: 'var(--primary-color-dark)',
                  '&:hover': {
                    borderColor: 'var(--primary-color)',
                    backgroundColor: 'rgba(165, 199, 228, 0.05)'
                  },
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                Запустить слайдшоу
              </Button>
            )}
          </Box>
        )}

        {/* Categories filter - only in topics view */}
        {viewMode === 'topics' && (
          <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {categories.map(category => (
              <Chip 
                key={category.id}
                label={category.name}
                clickable
                onClick={() => handleCategorySelect(category.id)}
                sx={{ 
                  px: 1, 
                  borderRadius: 2,
                  backgroundColor: selectedCategory === category.id ? category.color : 'rgba(165, 199, 228, 0.08)',
                  color: selectedCategory === category.id ? 'white' : 'text.primary',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: selectedCategory === category.id 
                      ? category.color 
                      : 'rgba(165, 199, 228, 0.15)'
                  }
                }}
              />
            ))}
          </Box>
        )}

        {/* Content Area - Topics or Cards */}
        <Paper 
          sx={{ 
            p: 2, 
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(165, 199, 228, 0.12)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            border: '1px solid rgba(165, 199, 228, 0.08)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)'
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : viewMode === 'topics' ? (
            <>
              {/* Topics Grid */}
              {filteredTopics.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100%',
                  gap: 2
                }}>
                  <TopicsIcon sx={{ fontSize: 60, color: 'var(--primary-color-light)' }} />
                  <Typography variant="h6" color="text.secondary">
                    {selectedCategory ? 'Нет тем в выбранной категории' : 'Нет тем для отображения'}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    onClick={handleOpenTopicDialog}
                    sx={{ mt: 2 }}
                  >
                    Создать тему
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {filteredTopics.map(topic => (
                    <Grid item xs={12} sm={6} md={4} key={topic.id}>
                      <Card 
                        onClick={() => handleTopicSelect(topic)}
                        sx={{ 
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          borderRadius: 3,
                          position: 'relative',
                          transition: 'transform 0.3s, box-shadow 0.3s',
                          boxShadow: '0 4px 12px rgba(165, 199, 228, 0.15)',
                          border: '1px solid rgba(165, 199, 228, 0.1)',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 8px 24px rgba(165, 199, 228, 0.25)',
                          }
                        }}
                      >
                        {/* More options menu button */}
                        <IconButton
                          onClick={(e) => handleOpenTopicMenu(e, topic.id)}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: 'rgba(0,0,0,0.5)',
                            bgcolor: 'rgba(255,255,255,0.8)',
                            zIndex: 2,
                            '&:hover': {
                              bgcolor: 'rgba(255,255,255,0.95)',
                            },
                            width: 32,
                            height: 32
                          }}
                        >
                          <MoreIcon fontSize="small" />
                        </IconButton>
                        
                        {/* Category color indicator */}
                        <Box 
                          sx={{ 
                            height: 8, 
                            bgcolor: topic.color || 'var(--primary-color)',
                            width: '100%'
                          }}
                        />
                        
                        <CardContent sx={{ 
                          p: 3, 
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}>
                          <Box>
                            <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Chip 
                                label={categories.find(c => c.id === topic.categoryId)?.name || 'Предмет'} 
                                size="small"
                                sx={{ 
                                  bgcolor: `${topic.color || 'var(--primary-color)'}20`, 
                                  color: topic.color || 'var(--primary-color)',
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  height: 24
                                }}
                              />
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                color: 'text.secondary',
                                fontSize: '0.75rem',
                                fontWeight: 500
                              }}>
                                <TopicIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                                {topic.cardsCount}
                              </Box>
                            </Box>
                            
                            <Typography 
                              variant="h6" 
                              component="div" 
                              sx={{ 
                                fontWeight: 600,
                                mb: 1.5,
                                fontSize: '1.1rem'
                              }}
                            >
                              {topic.title}
                            </Typography>
                            
                            {topic.description && (
                              <Typography 
                                variant="body2"
                                sx={{ 
                                  color: 'text.secondary',
                                  fontSize: '0.85rem',
                                  mb: 2,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {topic.description}
                              </Typography>
                            )}
                          </Box>
                          
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            pt: 1,
                            borderTop: '1px solid',
                            borderColor: 'rgba(165, 199, 228, 0.1)'
                          }}>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(topic.createdAt).toLocaleDateString('ru-RU')}
                            </Typography>
                            <Button
                              variant="text"
                              size="small"
                              sx={{ 
                                color: 'var(--primary-color-dark)',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                '&:hover': {
                                  backgroundColor: 'rgba(165, 199, 228, 0.08)'
                                }
                              }}
                            >
                              Открыть
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          ) : (
            <>
              {/* Flashcards Grid */}
              {filteredFlashcards.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100%',
                  gap: 2
                }}>
                  <SchoolIcon sx={{ fontSize: 60, color: 'var(--primary-color-light)' }} />
                  <Typography variant="h6" color="text.secondary">
                    {showFavorites ? 'Нет избранных карточек' : 'Нет карточек для отображения'}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    onClick={handleOpenCardDialog}
                    sx={{ mt: 2 }}
                  >
                    Создать карточку
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {filteredFlashcards.map(card => (
                    <Grid item xs={12} sm={6} md={4} key={card.id}>
                      <Card 
                        sx={{ 
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          borderRadius: 3,
                          position: 'relative',
                          transition: 'transform 0.3s, box-shadow 0.3s',
                          boxShadow: '0 4px 12px rgba(165, 199, 228, 0.15)',
                          border: '1px solid rgba(165, 199, 228, 0.1)',
                          overflow: 'hidden',
                          backgroundColor: flippedCards[card.id] ? '#f8fbff' : 'white',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 8px 24px rgba(165, 199, 228, 0.25)',
                          }
                        }}
                      >
                        {/* More options menu button */}
                        <IconButton
                          onClick={(e) => handleOpenCardMenu(e, card.id)}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: 'rgba(0,0,0,0.5)',
                            bgcolor: 'rgba(255,255,255,0.8)',
                            zIndex: 2,
                            '&:hover': {
                              bgcolor: 'rgba(255,255,255,0.95)',
                            },
                            width: 32,
                            height: 32
                          }}
                        >
                          <MoreIcon fontSize="small" />
                        </IconButton>
                        
                        {/* Category indicator */}
                        <Box 
                          sx={{ 
                            height: 8, 
                            bgcolor: selectedTopic?.color || 'var(--primary-color)',
                            width: '100%'
                          }}
                        />
                        
                        <CardContent sx={{ 
                          p: 3, 
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}>
                          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(card.id);
                              }}
                              sx={{ color: card.favorite ? '#E9D296' : 'rgba(0,0,0,0.3)' }}
                            >
                              <StarIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          
                          <Typography 
                            variant="body1" 
                            component="div" 
                            sx={{ 
                              fontWeight: 600,
                              mb: 2,
                              fontSize: '1rem',
                              minHeight: flippedCards[card.id] ? 0 : 100,
                              display: flippedCards[card.id] ? 'none' : 'block'
                            }}
                          >
                            {card.front}
                          </Typography>
                          
                          <Typography 
                            variant="body2"
                            sx={{ 
                              color: 'text.secondary',
                              fontWeight: 400,
                              display: flippedCards[card.id] ? 'block' : 'none',
                              minHeight: flippedCards[card.id] ? 100 : 0
                            }}
                          >
                            {card.back}
                          </Typography>
                        </CardContent>
                        
                        <CardActions sx={{ p: 2, pt: 0, justifyContent: 'center' }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<FlipIcon />}
                            onClick={() => handleFlipCard(card.id)}
                            sx={{ 
                              borderColor: 'var(--primary-color-light)',
                              color: 'var(--primary-color-dark)',
                              '&:hover': {
                                borderColor: 'var(--primary-color)',
                                backgroundColor: 'rgba(165, 199, 228, 0.05)'
                              },
                              textTransform: 'none',
                              borderRadius: 2,
                              width: '100%'
                            }}
                          >
                            {flippedCards[card.id] ? 'Вопрос' : 'Ответ'}
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Paper>
      </Box>
      
      {/* Floating Action Button */}
      <Zoom in={true} style={{ transitionDelay: '500ms' }}>
        <Fab 
          color="primary" 
          aria-label="add" 
          onClick={viewMode === 'topics' ? handleOpenTopicDialog : handleOpenCardDialog}
          sx={{ 
            position: 'fixed', 
            bottom: 24, 
            right: 24,
            bgcolor: 'var(--primary-color)',
            '&:hover': { bgcolor: 'var(--primary-color-dark)' }
          }}
        >
          <AddIcon />
        </Fab>
      </Zoom>

      {/* Add Topic Dialog */}
      <Dialog
        open={topicDialogOpen}
        onClose={handleCloseTopicDialog}
        PaperProps={{
          sx: {
            borderRadius: 3,
            width: '100%',
            maxWidth: 500
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editMode ? 'Редактировать тему' : 'Создать новую тему'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              autoFocus
              label="Название темы"
              fullWidth
              value={newTopicData.title}
              onChange={(e) => setNewTopicData({...newTopicData, title: e.target.value})}
              sx={{ mt: 1 }}
            />
            <TextField
              label="Описание (необязательно)"
              fullWidth
              multiline
              rows={3}
              value={newTopicData.description}
              onChange={(e) => setNewTopicData({...newTopicData, description: e.target.value})}
            />
            
            {/* Скрытый выбор категории, автоматически берем первую */}
            <input 
              type="hidden" 
              value={newTopicData.categoryId} 
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={handleCloseTopicDialog}
            sx={{ color: 'text.secondary' }}
          >
            Отмена
          </Button>
          <Button 
            variant="contained"
            onClick={handleAddOrUpdateTopic}
            disabled={!newTopicData.title}
            sx={{ 
              bgcolor: 'var(--primary-color)',
              '&:hover': { bgcolor: 'var(--primary-color-dark)' }
            }}
          >
            {editMode ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Card Dialog */}
      <Dialog
        open={cardDialogOpen}
        onClose={handleCloseCardDialog}
        PaperProps={{
          sx: {
            borderRadius: 3,
            width: '100%',
            maxWidth: 500
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editMode ? 'Редактировать карточку' : 'Создать новую карточку'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              autoFocus
              label="Вопрос"
              placeholder="Например: Что такое фотосинтез?"
              fullWidth
              value={newCardData.front}
              onChange={(e) => setNewCardData({...newCardData, front: e.target.value})}
              sx={{ mt: 1 }}
            />
            <TextField
              label="Ответ"
              placeholder="Например: Процесс, при котором растения превращают углекислый газ и воду в глюкозу..."
              fullWidth
              multiline
              rows={4}
              value={newCardData.back}
              onChange={(e) => setNewCardData({...newCardData, back: e.target.value})}
            />
            
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Тема
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {topics.map(topic => (
                  <Chip 
                    key={topic.id}
                    label={topic.title}
                    clickable
                    onClick={() => setNewCardData({
                      ...newCardData, 
                      topicId: topic.id,
                      categoryId: topic.categoryId
                    })}
                    sx={{ 
                      bgcolor: newCardData.topicId === topic.id ? topic.color || 'var(--primary-color)' : `${topic.color || 'var(--primary-color)'}20`,
                      color: newCardData.topicId === topic.id ? 'white' : topic.color || 'var(--primary-color)',
                      fontWeight: 500
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={handleCloseCardDialog}
            sx={{ color: 'text.secondary' }}
          >
            Отмена
          </Button>
          <Button 
            variant="contained"
            onClick={handleAddOrUpdateCard}
            disabled={!newCardData.front || !newCardData.back || !newCardData.topicId}
            sx={{ 
              bgcolor: 'var(--primary-color)',
              '&:hover': { bgcolor: 'var(--primary-color-dark)' }
            }}
          >
            {editMode ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Slideshow Dialog */}
      <Dialog
        fullScreen
        open={slideshowMode}
        onClose={closeSlideshow}
        PaperProps={{
          sx: {
            bgcolor: fullscreen ? '#f8fbff' : 'rgba(255, 255, 255, 0.97)',
            backgroundImage: 'linear-gradient(145deg, rgba(201, 221, 240, 0.1), rgba(234, 242, 248, 0.3))',
          }
        }}
      >
        {/* Progress bar */}
        <LinearProgress 
          variant="determinate" 
          value={calculateProgress()} 
          sx={{ 
            height: 4,
            '& .MuiLinearProgress-bar': {
              backgroundColor: 'var(--primary-color)'
            }
          }}
        />
        
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid rgba(165, 199, 228, 0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--primary-color-dark)' }}>
              {selectedTopic?.title || 'Карточки'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentSlideIndex + 1} из {filteredFlashcards.length}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={fullscreen ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}>
              <IconButton 
                onClick={toggleFullscreen}
                sx={{ color: 'var(--primary-color-dark)' }}
              >
                {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Закрыть слайдшоу">
              <IconButton 
                onClick={closeSlideshow}
                sx={{ color: 'var(--primary-color-dark)' }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Card Area or Completion Screen */}
        {!slideshowComplete ? (
          /* Regular Card Display */
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            height: 'calc(100% - 120px)',
            p: { xs: 2, md: 5 }
          }}>
            {currentCard && (
              <Box 
                onClick={toggleAnswer}
                sx={{
                  width: '100%',
                  maxWidth: 800,
                  height: { xs: 'auto', md: 400 },
                  backgroundColor: 'white',
                  borderRadius: 4,
                  boxShadow: '0 10px 40px rgba(165, 199, 228, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                {/* Top color bar */}
                <Box 
                  sx={{ 
                    height: 8, 
                    bgcolor: selectedTopic?.color || 'var(--primary-color)',
                    width: '100%'
                  }}
                />
                
                {/* Review status indicator */}
                {reviewedCards[currentCard.id] && (
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      bgcolor: reviewedCards[currentCard.id] === 'correct' ? 'rgba(158, 208, 163, 0.15)' : 'rgba(232, 155, 162, 0.15)',
                      color: reviewedCards[currentCard.id] === 'correct' ? 'var(--success-color)' : 'var(--error-color)',
                      borderRadius: '50%',
                      p: 1,
                    }}
                  >
                    {reviewedCards[currentCard.id] === 'correct' ? <CorrectIcon /> : <WrongIcon />}
                  </Box>
                )}
                
                {/* Card content */}
                <Box sx={{ 
                  p: { xs: 3, md: 5 }, 
                  pt: { xs: 4, md: 6 },
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  {!showAnswer ? (
                    <Typography 
                      variant="h5" 
                      component="div"
                      sx={{ 
                        fontWeight: 600,
                        color: '#2A5A84',
                        maxWidth: '90%'
                      }}
                    >
                      {currentCard.front}
                    </Typography>
                  ) : (
                    <Box>
                      <Typography 
                        variant="body1"
                        sx={{ 
                          color: 'text.secondary',
                          maxWidth: '90%',
                          mx: 'auto'
                        }}
                      >
                        {currentCard.back}
                      </Typography>
                      
                      {/* Rating buttons that appear with the answer */}
                      <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', gap: 3 }}>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<WrongIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            markCard('wrong');
                          }}
                          sx={{ 
                            borderColor: 'var(--error-color)',
                            color: 'var(--error-color)',
                            borderRadius: 2,
                            px: 3
                          }}
                        >
                          Не знаю
                        </Button>
                        <Button
                          variant="outlined"
                          color="success"
                          startIcon={<CorrectIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            markCard('correct');
                          }}
                          sx={{ 
                            borderColor: 'var(--success-color)',
                            color: 'var(--success-color)',
                            borderRadius: 2,
                            px: 3
                          }}
                        >
                          Знаю
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
                
                {/* Prompt text */}
                <Box sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  borderTop: '1px solid rgba(165, 199, 228, 0.1)',
                }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                  >
                    {showAnswer ? "Нажмите, чтобы снова увидеть вопрос" : "Нажмите, чтобы увидеть ответ"}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          /* Completion Screen */
          <Fade in={slideshowComplete}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center',
              height: 'calc(100% - 120px)',
              p: { xs: 2, md: 5 },
              textAlign: 'center'
            }}>
              <Box 
                sx={{ 
                  width: '100%',
                  maxWidth: 700,
                  bgcolor: 'white',
                  borderRadius: 4,
                  boxShadow: '0 10px 40px rgba(165, 199, 228, 0.15)',
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Box sx={{ mb: 3 }}>
                  <StatsIcon sx={{ fontSize: 60, color: 'var(--primary-color)' }} />
                </Box>
                
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--primary-color-dark)', mb: 2 }}>
                  Отлично! Вы завершили все карточки
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
                  Вы просмотрели все карточки этой темы. Ниже представлена сводка ваших результатов.
                </Typography>
                
                {/* Results summary */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: { xs: 2, md: 4 },
                  mb: 5,
                  width: '100%',
                  flexWrap: 'wrap'
                }}>
                  {(() => {
                    const stats = calculateStats();
                    return (
                      <>
                        <Box sx={{ 
                          bgcolor: 'rgba(158, 208, 163, 0.1)', 
                          p: 2, 
                          borderRadius: 2,
                          minWidth: 100,
                          flex: 1
                        }}>
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              fontWeight: 700, 
                              color: 'var(--success-color)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 1
                            }}
                          >
                            <CorrectIcon /> {stats.correct}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Знаю
                          </Typography>
                        </Box>
                        
                        <Box sx={{ 
                          bgcolor: 'rgba(232, 155, 162, 0.1)', 
                          p: 2, 
                          borderRadius: 2,
                          minWidth: 100,
                          flex: 1
                        }}>
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              fontWeight: 700, 
                              color: 'var(--error-color)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 1
                            }}
                          >
                            <WrongIcon /> {stats.wrong}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Не знаю
                          </Typography>
                        </Box>
                        
                        <Box sx={{ 
                          bgcolor: 'rgba(165, 199, 228, 0.1)', 
                          p: 2, 
                          borderRadius: 2,
                          minWidth: 100,
                          flex: 1
                        }}>
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              fontWeight: 700, 
                              color: 'var(--primary-color-dark)'
                            }}
                          >
                            {stats.skipped}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Пропущено
                          </Typography>
                        </Box>
                      </>
                    );
                  })()}
                </Box>
                
                {/* Action buttons */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<CloseIcon />}
                    onClick={closeSlideshow}
                    sx={{ 
                      borderColor: 'var(--dark-gray)',
                      color: 'var(--dark-gray)',
                      borderRadius: 2,
                      px: 3
                    }}
                  >
                    Закончить
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<ReplayIcon />}
                    onClick={restartSlideshow}
                    sx={{ 
                      borderColor: 'var(--primary-color-light)',
                      color: 'var(--primary-color-dark)',
                      borderRadius: 2,
                      px: 3
                    }}
                  >
                    Начать сначала
                  </Button>
                  
                  {/* Only show if there are wrong cards to review */}
                  {hasWrongCards() && (
                    <Button
                      variant="contained"
                      startIcon={<WrongIcon />}
                      onClick={reviewWrongCards}
                      sx={{ 
                        bgcolor: 'var(--primary-color)',
                        '&:hover': { bgcolor: 'var(--primary-color-dark)' },
                        borderRadius: 2,
                        px: 3
                      }}
                    >
                      Повторить сложные
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </Fade>
        )}
        
        {/* Navigation Controls - Only show during active slideshow, not on completion screen */}
        {!slideshowComplete && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            p: 2,
            gap: 2
          }}>
            <Button
              variant="outlined"
              startIcon={<PrevIcon />}
              onClick={goToPrevCard}
              disabled={currentSlideIndex === 0}
              sx={{
                borderColor: currentSlideIndex === 0 ? 'rgba(0,0,0,0.1)' : 'var(--primary-color-light)',
                color: currentSlideIndex === 0 ? 'rgba(0,0,0,0.3)' : 'var(--primary-color-dark)',
                borderRadius: 2,
                px: 3
              }}
            >
              Предыдущая
            </Button>
            
            <Button
              variant="contained"
              endIcon={<NextIcon />}
              onClick={goToNextCard}
              disabled={currentSlideIndex === filteredFlashcards.length - 1}
              sx={{
                bgcolor: currentSlideIndex === filteredFlashcards.length - 1 ? 'rgba(0,0,0,0.1)' : 'var(--primary-color)',
                '&:hover': {
                  bgcolor: currentSlideIndex === filteredFlashcards.length - 1 ? 'rgba(0,0,0,0.1)' : 'var(--primary-color-dark)'
                },
                color: currentSlideIndex === filteredFlashcards.length - 1 ? 'rgba(0,0,0,0.3)' : 'white',
                borderRadius: 2,
                px: 3
              }}
            >
              Следующая
            </Button>
          </Box>
        )}
      </Dialog>

      {/* Topic context menu */}
      <Menu
        anchorEl={topicMenuAnchorEl}
        open={Boolean(topicMenuAnchorEl)}
        onClose={handleCloseTopicMenu}
        PaperProps={{
          sx: {
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: 2,
            minWidth: 180
          }
        }}
      >
        <MenuItem 
          onClick={() => {
            const topic = topics.find(t => t.id === menuTargetId);
            if (topic) handleEditTopic(topic);
          }}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: 'var(--primary-color-dark)' }} />
          </ListItemIcon>
          <ListItemText>Редактировать</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => handleDeleteRequest('topic', menuTargetId)}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: 'var(--error-color)' }} />
          </ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Card context menu */}
      <Menu
        anchorEl={cardMenuAnchorEl}
        open={Boolean(cardMenuAnchorEl)}
        onClose={handleCloseCardMenu}
        PaperProps={{
          sx: {
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: 2,
            minWidth: 180
          }
        }}
      >
        <MenuItem 
          onClick={() => {
            const card = flashcards.find(c => c.id === menuTargetId);
            if (card) handleEditCard(card);
          }}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: 'var(--primary-color-dark)' }} />
          </ListItemIcon>
          <ListItemText>Редактировать</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => handleDeleteRequest('card', menuTargetId)}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: 'var(--error-color)' }} />
          </ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Confirmation dialog for deleting */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {deleteType === 'topic' ? 'Удалить тему?' : 'Удалить карточку?'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {deleteType === 'topic' 
              ? 'Вы уверены, что хотите удалить эту тему? Все карточки в этой теме также будут удалены.' 
              : 'Вы уверены, что хотите удалить эту карточку?'}
          </Typography>
          {deleteType === 'topic' && topicToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(165, 199, 228, 0.05)', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {topicToDelete.title}
              </Typography>
              {topicToDelete.description && (
                <Typography variant="body2" color="text.secondary">
                  {topicToDelete.description}
                </Typography>
              )}
            </Box>
          )}
          {deleteType === 'card' && cardToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(165, 199, 228, 0.05)', borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Вопрос:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                {cardToDelete.front}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Ответ:
              </Typography>
              <Typography variant="body1">
                {cardToDelete.back}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: 'text.secondary' }}
          >
            Отмена
          </Button>
          <Button 
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            sx={{ bgcolor: 'var(--error-color)' }}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 