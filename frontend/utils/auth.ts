export const setJwtToken = (token: string) => {
  localStorage.setItem('jwtToken', token);
};

export const getJwtToken = (): string | null => {
  return localStorage.getItem('jwtToken');
};

export const clearJwtToken = () => {
  localStorage.removeItem('jwtToken');
};
