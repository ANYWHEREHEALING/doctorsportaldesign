# Anywhere Healing · Practitioner portal

Web dashboard for practitioners. Patients share their Charisma Ring data
(sleep, heart rate, HRV, stress, sessions) from the app, and the practitioner
sees daily charts plus weekly and monthly reports.

## How it fits together

```
browser ──> doctors.anywherehealing.com (this app, port 3100)
                 └── /api/portal/*  ──(forwarded)──> API server (NewBackend, port 5800)
```

- The browser only talks to this site. `next.config.js` forwards `/api/portal/*`
  to the API, so the sign-in cookie is first-party and `httpOnly`. Page scripts
  never see a token.
- All data and rules live in the API (`portalController.js`). This app only displays.

## Pages

| Path | What |
|---|---|
| `/` | Sign in |
| `/accept-invite?token=…` | From the invitation email: set name and password |
| `/forgot-password`, `/reset-password?token=…` | Password reset |
| `/patients` | Patients sharing with you, plus invitations; "Invite patient" |
| `/patients/:id` | Overview, Sleep, Heart rate, HRV, Stress, Sessions, Reports |
| `/patients/:id/report?type=weekly\|monthly&period=…` | Printable report; "Download PDF" |

## Run locally

```bash
npm install
API_INTERNAL_URL=http://localhost:5800 npm run dev   # http://localhost:3100
```

For local http, set `PORTAL_INSECURE_COOKIE=true` and `PORTAL_URL=http://localhost:3100`
on the API, otherwise the browser drops the secure cookie.

## Deploy (VPS, Docker)

See `deploy/README.md` in the delivery, or:

```bash
docker build --build-arg API_INTERNAL_URL=http://api:5800 -t anywhereheal-portal .
```
