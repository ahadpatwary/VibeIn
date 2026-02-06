export const protectedRoutes = new Map([
  ['/feed', ['user', 'admin']],
  ['/admin', ['admin']],
  ['/profile', ['user', 'admin']],
  ['/register/user_details', ['user', 'admin']],
]);


export const publicRoutes = new Set(['/about', '/unauthorized', '/notFoundPage']);

export const authRoutes = new Set(['/', '/login', '/register']);