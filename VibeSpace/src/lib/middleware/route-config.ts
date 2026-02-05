export const protectedRoutes = [
  { path: '/feed', roles: ['user', 'admin'] },
  { path: '/admin', roles: ['admin'] },
  { path: '/profile', roles: ['user', 'admin'] },
];

export const publicRoutes = ['/', '/login', '/register', '/about'];