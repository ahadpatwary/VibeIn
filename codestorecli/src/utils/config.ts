import Configstore from 'configstore';
import packageJson from '../../package.json';

// প্রজেক্টের নামে একটি লোকাল স্টোরেজ তৈরি হবে
const config = new Configstore(packageJson.name as string);

export const setToken = (token: string): void => {
  config.set('auth_token', token);
};

export const getToken = (): string | undefined => {
  return config.get('auth_token');
};

export const clear = (): void => {
  config.clear();
};