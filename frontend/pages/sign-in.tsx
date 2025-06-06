import { useState } from 'react';
import { useRouter } from 'next/router';
import { TextInput, PasswordInput, Button, Title, Text, Container } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { setJwtToken } from './utils/auth';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    console.log("Attempting login with:", { email, password });
    
    const response = await fetch('http://localhost:8000/api/auth/sign-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      }),
    });

    const responseData = await response.json();
    console.log("Server response:", responseData);

    if (!response.ok) {
      throw new Error(responseData.detail || 'Ошибка входа');
    }

    setJwtToken(responseData.access_token);
    router.push('/tasks');
  } catch (error) {
    console.error("Login error:", error);
    notifications.show({
      title: 'Ошибка',
      message: error instanceof Error ? error.message : 'Ошибка входа',
      color: 'red',
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <Container size="xs" py="xl">
      <Title order={1} mb="xl" style={{ textAlign: 'center' }}>
        Вход
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
          placeholder="Ваш пароль"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          mb="xl"
        />
        <Button type="submit" fullWidth loading={loading}>
          Войти
        </Button>
      </form>
      <Text ta="center" mt="sm">
        Нет аккаунта? <a href="/sign-up">Зарегистрируйтесь</a>
      </Text>
    </Container>
  );
}