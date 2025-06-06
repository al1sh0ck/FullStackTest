import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Title,
  Text,
  Card,
  TextInput,
  Button,
  Group,
  Checkbox,
  ActionIcon,
  Stack,
  SegmentedControl,
  Loader,
  Center,
} from '@mantine/core';
import { IconTrash, IconEdit, IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { getJwtToken, clearJwtToken } from './utils/auth';

interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // --- Новые состояния для пагинации ---
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Проверяем авторизацию и загружаем задачи
  useEffect(() => {
    const token = getJwtToken();
    if (!token) {
      router.push('/sign-in');
    } else {
      fetchTasks(page);
    }
  }, [router, page]); // добавляем page в зависимости, чтобы при изменении страницы обновлять список

  // Загружаем задачи с бэка
  const fetchTasks = useCallback(async (currentPage: number) => {
    setIsLoading(true);
    try {
      const skip = (currentPage - 1) * pageSize;
      const res = await fetch(`http://localhost:8000/api/tasks?skip=${skip}&limit=${pageSize}`, {
        headers: {
          Authorization: `Bearer ${getJwtToken()}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch tasks');

      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось загрузить задачи',
        color: 'red',
      });
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Добавляем новую задачу
  const addTask = async () => {
    if (!newTaskTitle.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch('http://localhost:8000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getJwtToken()}`,
        },
        body: JSON.stringify({ title: newTaskTitle }),
      });

      if (!res.ok) throw new Error('Failed to add task');

      setNewTaskTitle('');
      // после добавления - перезагружаем текущую страницу
      fetchTasks(page);
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось добавить задачу',
        color: 'red',
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Обновляем статус задачи
  const toggleTask = async (taskId: number, completed: boolean) => {
    try {
      const res = await fetch(`http://localhost:8000/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getJwtToken()}`,
        },
        body: JSON.stringify({ completed }),
      });

      if (!res.ok) throw new Error('Failed to update task');

      fetchTasks(page);
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось обновить задачу',
        color: 'red',
      });
    }
  };

  // Удаляем задачу
  const deleteTask = async (taskId: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getJwtToken()}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete task');

      // если удалили последнюю задачу на странице, возможно стоит перейти на предыдущую страницу
      if (tasks.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchTasks(page);
      }
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось удалить задачу',
        color: 'red',
      });
    }
  };

  // Фильтруем задачи по статусу
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  // Выход из аккаунта
  const handleLogout = () => {
    clearJwtToken();
    router.push('/sign-in');
  };

  // Обработка нажатия Enter при добавлении задачи
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  return (
    <Container size="sm" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1}>To-Do List</Title>
        <Button variant="outline" color="red" onClick={handleLogout}>
          Выйти
        </Button>
      </Group>

      {/* Добавление новой задачи */}
      <Group mb="xl">
        <TextInput
          placeholder="Новая задача..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1 }}
          disabled={isAdding}
        />
        <Button
          leftSection={isAdding ? <Loader size="xs" /> : <IconPlus size={16} />}
          onClick={addTask}
          disabled={isAdding}
        >
          Добавить
        </Button>
      </Group>

      {/* Фильтры */}
      <SegmentedControl
        value={filter}
        onChange={(value) => setFilter(value as 'all' | 'active' | 'completed')}
        data={[
          { label: 'Все', value: 'all' },
          { label: 'Активные', value: 'active' },
          { label: 'Завершённые', value: 'completed' },
        ]}
        mb="xl"
      />

      {/* Список задач */}
      <Stack gap={8}>
        {isLoading ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : filteredTasks.length === 0 ? (
          <Text color="dimmed" ta="center">
            {filter === 'all'
              ? 'Нет задач. Добавь что-нибудь!'
              : filter === 'active'
              ? 'Нет активных задач'
              : 'Нет завершённых задач'}
          </Text>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} shadow="sm" p="sm" withBorder>
              <Group justify="space-between">
                <Checkbox
                  checked={task.completed}
                  onChange={(e) => toggleTask(task.id, e.currentTarget.checked)}
                  label={task.title}
                  style={{ textDecoration: task.completed ? 'line-through' : 'none' }}
                />
                <Group gap="xs">
                  <ActionIcon color="blue" variant="light">
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon color="red" variant="light" onClick={() => deleteTask(task.id)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            </Card>
          ))
        )}
      </Stack>

      {/* Навигация по страницам */}
      <Group justify="center" mt="xl" mb="xl" gap="xs">
        <Button
          disabled={page === 1 || isLoading}
          onClick={() => setPage(page - 1)}
          variant="outline"
        >
          Назад
        </Button>
        <Text ta="center" style={{ lineHeight: '32px' }}>
          Страница {page}
        </Text>
        <Button
          disabled={tasks.length < pageSize || isLoading}
          onClick={() => setPage(page + 1)}
          variant="outline"
        >
          Вперед
        </Button>
      </Group>
    </Container>
  );
}
