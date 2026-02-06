export const protectedRoutes = [
  { path: '/feed', roles: ['user', 'admin'] },
  { path: '/admin', roles: ['admin'] },
  { path: '/profile', roles: ['user', 'admin'] },
  { path: '/register/user_details', roles: ['user', 'admin']}
];

export const publicRoutes = ['/about', '/unauthorized', '/notFoundPage'];

export const authRoutes = ['/', '/login', '/register', ];