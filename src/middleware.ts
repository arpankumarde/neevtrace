import { authMiddleware } from '@civic/auth/nextjs/middleware'

export default authMiddleware();

export const config = {
  // Only protect routes inside the protected directory
  matcher: [
    '/protected/(.*)', 
  ],
}
