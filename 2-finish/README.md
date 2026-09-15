# AI Testers – Automate 2FA and TOTP demo (finish)

**Finished result** of the webinar from **16.09.2026** - this is the project state after the work is done.

Test automation project for the **AI Testers** demo application (`https://aitesters.byst.re`).
Written in Playwright + TypeScript, it uses the Page Object Model pattern and Faker.js to
generate test data.

Tests still **log in through the UI form** before each test, but the login flow now handles
**two-factor authentication (2FA)**: after submitting username and password, it generates the
current 6-digit TOTP code with the [`otplib`](https://www.npmjs.com/package/otplib) library and
submits it on the second factor step.

## What was done

Starting from `1-start/` and the prompt in [`PROMPT.md`](PROMPT.md):

- **`src/helpers/totp.ts`** - `generateTotpCode(secret)` returns the current code; if fewer than
  5 seconds are left in the 30-second window, or the code from this window was already used, it
  waits for the next window first (the server rejects a reused code)
- **`LoginPage`** - MFA step locators, a `submitTotpCode(code)` method and a `login()` that
  handles the TOTP step before waiting for the dashboard
- **`TotpCredentials`** type and `demoClientUser.totpSecret` read from `DEMO_USER_CLIENT_TOTP_SECRET_KEY`
- **`loginViaUi`** auto fixture timeout raised to `60_000` ms to cover waiting for a fresh window
- **Negative test** - an invalid code shows an error toast and keeps the user on the second factor step
- **CI** - the new secret passed to the Playwright job, **`CLAUDE.md`** updated

## Installation

1. Clone the repository and enter this folder:

```bash
git clone https://github.com/AI-Testers-pl/aitesters-2fa-totp-demo.git
cd aitesters-2fa-totp-demo/2-finish
```

2. Install dependencies:

```bash
npm install
```

3. Install the Playwright browsers:

```bash
npx playwright install
```

## Configuration

Copy the template file and fill in the values:

```bash
cp config/.env.local.dist config/.env.local
```

Variables in `config/.env.local`:

- `BASE_URL` - the application address (`https://aitesters.byst.re`)
- `DEMO_USER_CLIENT_USERNAME`, `DEMO_USER_CLIENT_PASSWORD`, `DEMO_USER_CLIENT_DISPLAY_NAME` - client account
- `DEMO_USER_ADMIN_USERNAME`, `DEMO_USER_ADMIN_PASSWORD`, `DEMO_USER_ADMIN_DISPLAY_NAME` - admin account
- `DEMO_USER_CLIENT_TOTP_SECRET_KEY` - Base32 TOTP secret of the client account (the **Manual setup key**
  shown when enabling 2FA on the `/profile` page)

> `config/.env.local` is git-ignored - never commit the secret. For GitHub Actions, add it as a repository
> secret named `DEMO_USER_CLIENT_TOTP_SECRET_KEY`.

## Running

```bash
npx playwright test       # run all tests headless
npm run tests:ui          # Playwright UI mode
npm run typecheck         # TypeScript type check
npm run check             # Biome: lint + format
npm run check:ci          # Biome in CI mode
npm run format            # Biome: auto-format
```

## Conventions

The full project guidelines (`data-testid` locators, grouping locators in page objects,
TypeScript rules, Biome style, fixtures, TOTP helper, CI) are described in the [CLAUDE.md](CLAUDE.md) file.
