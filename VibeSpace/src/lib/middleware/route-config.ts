export const protectedRoutes = [
  { path: '/feed', roles: ['user', 'admin'] },
  { path: '/admin', roles: ['admin'] },
  { path: '/profile', roles: ['user', 'admin'] },
];

export const publicRoutes = ['/about', '/notFoundPage'];

export const authRoutes = [ '/login', '/register', '/register/user_details'];