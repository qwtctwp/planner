import { Box, Typography, Button, Container, Paper, Grid, Card, CardContent, CardMedia, Stack, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import Link from 'next/link';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Студенческий планировщик
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Веб-приложение для эффективной организации учебного процесса
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography variant="body1" paragraph>
            Комплексное решение для студентов, которое помогает структурировать 
            учебный процесс, управлять заданиями и отслеживать свой прогресс.
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <CalendarMonthIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Интерактивный календарь
                </Typography>
                <Typography>
                  Удобный интерфейс для просмотра и планирования расписания занятий с поддержкой 
                  дневного, недельного и месячного представлений.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <AssignmentIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Управление заданиями
                </Typography>
                <Typography>
                  Структурированная система организации домашних заданий, проектов и личных задач 
                  с сортировкой по приоритету и срокам.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <BarChartIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Аналитика и статистика
                </Typography>
                <Typography>
                  Визуализация учебной нагрузки, отслеживание прогресса и анализ эффективности 
                  для оптимизации учебного процесса.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
            Основные преимущества
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Единое пространство для всех учебных материалов" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Настраиваемые уведомления о сроках и дедлайнах" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Синхронизация с популярными учебными платформами" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Система категоризации предметов и заданий" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Отслеживание прогресса и успеваемости" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Интуитивный интерфейс и удобство использования" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Typography variant="h6" gutterBottom>
            Демонстрационная версия проекта на GitHub Pages
          </Typography>
          <Typography paragraph>
            Для полноценного использования приложения необходима локальная установка 
            с настройкой базы данных PostgreSQL и переменных окружения.
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
            sx={{ mt: 3 }}
          >
            <Button 
              variant="contained" 
              size="large" 
              component="a" 
              href="https://github.com/qwtctwp/diploma"
              target="_blank"
              startIcon={<SchoolIcon />}
            >
              Репозиторий GitHub
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              component="a" 
              href="https://github.com/qwtctwp/diploma/blob/main/README.md"
              target="_blank"
              startIcon={<LocalLibraryIcon />}
            >
              Документация
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: 'primary.lighter' }}>
        <Typography variant="body2" align="center" color="text.secondary">
          © 2025 Студенческий планировщик | Дипломный проект
        </Typography>
      </Paper>
    </Container>
  );
} 