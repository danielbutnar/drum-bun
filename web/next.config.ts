import type {NextConfig} from 'next'

const isDev = process.env.NODE_ENV === 'development'

// No third-party scripts, fonts or frames: everything is served from this
// origin, and the chat streams from /api/chat. Without nonces (the pages are
// static or ISR), following the Next.js 16 CSP guide.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ')

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {key: 'Content-Security-Policy', value: csp},
          {key: 'X-Content-Type-Options', value: 'nosniff'},
          {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
        ],
      },
    ]
  },
}

export default nextConfig
