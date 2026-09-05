import Configstore from 'configstore';


const config = new Configstore("codestore");

export const setToken = (token: string): void => {
  config.set('auth_token', token);
};

export const getToken = (): string | undefined => {
  return config.get('auth_token');
};

export const clear = (): void => {
  config.clear();
};