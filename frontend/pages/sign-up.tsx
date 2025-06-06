import { useState } from 'react';
import { useRouter } from 'next/router';
import { TextInput, PasswordInput, Button, Title, Text, Container } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { setJwtToken } from '../utils/auth';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Ошибка регистрации');

      const { access_token } = await response.json();
      setJwtToken(access_token);
      router.push('/tasks'); // Редирект после успеха
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: 'Такой email уже занят',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xs" py="xl">
      <Title order={1} ta="center" mb="xl">
        Регистрация
      </Title>
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Email"
          placeholder="your@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          mb="md"
        />
        <PasswordInput
          label="Пароль"
          placeholder="Придумайте пароль"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          mb="xl"
        />
        <Button type="submit" fullWidth loading={loading}>
          Зарегистрироваться
        </Button>
      </form>
      <Text ta="center" mt="sm">
        Уже есть аккаунт? <a href="/sign-in">Войдите</a>
      </Text>
    </Container>
  );
}