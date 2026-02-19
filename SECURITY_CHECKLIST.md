# Security Checklist (Production)

Use this before and after deployment.

## Secrets & environment

- [ ] No `.env.local` or real secrets committed; `.env*` in `.gitignore`
- [ ] `JWT_SECRET` is 32+ chars, random (e.g. `openssl rand -base64 32`)
- [ ] Production uses Stripe **live** keys only in production env
- [ ] `STRIPE_WEBHOOK_SECRET` is the one from the **production** webhook endpoint

## MongoDB Atlas

- [ ] Database user has a strong, unique password
- [ ] Password with special chars is URL-encoded in `MONGODB_URI`
- [ ] Network Access: restrict IPs if possible; for Vercel/Render, document why `0.0.0.0/0` is used

## Application

- [ ] `NEXT_PUBLIC_APP_URL` is `https://` in production
- [ ] Auth cookie: `httpOnly`, `secure`, `sameSite` (already set in code)
- [ ] Admin routes (`/admin`, `/api/admin/*`) protected by middleware (admin role)
- [ ] Rate limiting enabled on login, register, checkout APIs
- [ ] No Stripe secret or JWT secret in client bundle or `NEXT_PUBLIC_*` vars

## Stripe

- [ ] Webhook endpoint is HTTPS and uses `STRIPE_WEBHOOK_SECRET` for verification
- [ ] Only required events (e.g. `checkout.session.completed`) sent to webhook
- [ ] Test webhook delivery returns 200 in Stripe Dashboard

## Dependencies & ops

- [ ] `npm audit` run and high/critical issues addressed
- [ ] Dependencies updated; Next.js and React on supported versions
- [ ] Build and start scripts run clean: `npm run build` && `npm run start`

## Optional hardening

- [ ] CSP header if you need strict script/style policy
- [ ] Vercel/Render environment set to production for all production deployments
- [ ] Logging/monitoring for failed auth and 4xx/5xx on payment and webhook routes
