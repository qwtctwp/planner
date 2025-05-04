import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../lib/auth';
import { assignmentRepository } from '../../../lib/db';

// Преобразование числовых ID в строки для клиентского кода
const formatAssignment = (assignment: any) => {
  if (!assignment) return null;
  return {
    ...assignment,
    id: assignment.id.toString(),
    lessonId: assignment.event_id ? assignment.event_id.toString() : '',
    dueDate: assignment.due_date ? assignment.due_date.toISOString() : null,
    completed: !!assignment.completed,
    status: assignment.status || (assignment.completed ? 'done' : 'todo'), // Default status based on completed flag
    description: assignment.description || '',
    title: assignment.title || ''
  };
};

// Обновление задания
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      console.log('PUT /api/assignments/[id] - id:', params.id);
      
      const assignmentId = parseInt(params.id);
      
      // Получаем тело запроса в сыром виде
      const rawBody = await req.text();
      console.log('Raw request body:', rawBody);

      // Преобразуем тело запроса в JSON
      const body = JSON.parse(rawBody);
      console.log('Тело запроса:', body);
      
      // Получаем параметры из тела запроса
      const { status, completed, title, description, dueDate } = body;
      
      console.log('Полученные параметры:', { status, completed, title, description, dueDate });
      
      // For status-only updates from Kanban drag, we'll only have status and completed
      if (status !== undefined && completed !== undefined && !title && !description && !dueDate) {
        console.log('Status-only update detected, completed value:', completed);
        const result = await assignmentRepository.updateStatus(
          assignmentId,
          status,
          completed
        );
        
        if (!result) {
          return NextResponse.json(
            { error: 'Задание не найдено' },
            { status: 404 }
          );
        }
        
        console.log('Status updated successfully:', result);
        return NextResponse.json(formatAssignment(result));
      }
      
      // For full updates, proceed as normal
      const existingAssignment = await assignmentRepository.getAssignmentById(assignmentId);
      if (!existingAssignment) {
        return NextResponse.json(
          { error: 'Задание не найдено' },
          { status: 404 }
        );
      }
      
      console.log('Существующее задание:', existingAssignment);
      
      // Используем явное приведение типов для completed, которое может прийти как строка
      const completedToUse = completed === undefined ? existingAssignment.completed : 
                            (completed === "true" || completed === true);
      
      console.log('completedToUse после приведения типов:', completedToUse);
      
      const titleToUse = title || existingAssignment.title;
      const descriptionToUse = description === undefined ? existingAssignment.description : description;
      const dueDateToUse = dueDate === undefined ? existingAssignment.due_date : (dueDate ? new Date(dueDate) : undefined);
      const statusToUse = status || existingAssignment.status || (completedToUse ? 'done' : 'todo');

      // Ensure there's a title
      if (!titleToUse) {
        return NextResponse.json(
          { error: 'Необходимо указать название задания' },
          { status: 400 }
        );
      }
      
      console.log('Параметры для обновления задания:', {
        titleToUse,
        descriptionToUse,
        dueDateToUse,
        completedToUse,
        statusToUse
      });
      
      // Обновление задания
      const assignment = await assignmentRepository.updateAssignment(
        assignmentId,
        titleToUse,
        descriptionToUse,
        dueDateToUse,
        completedToUse,
        statusToUse
      );
      
      if (!assignment) {
        return NextResponse.json(
          { error: 'Задание не найдено' },
          { status: 404 }
        );
      }
      
      console.log('Обновлено задание:', assignment);
      
      // Преобразуем ID в строку для клиентского кода
      const formattedAssignment = formatAssignment(assignment);
      
      // Создаем ответ с правильной кодировкой
      const response = NextResponse.json(formattedAssignment);
      response.headers.set('Content-Type', 'application/json; charset=utf-8');
      
      return response;
    } catch (error) {
      console.error('Ошибка при обновлении задания:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
}

// Удаление задания
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      console.log('DELETE /api/assignments/[id] - id:', params.id);
      
      const assignmentId = parseInt(params.id);
      
      // Удаление задания
      await assignmentRepository.deleteAssignment(assignmentId);
      
      console.log('Задание удалено успешно');
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Ошибка при удалении задания:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
} 