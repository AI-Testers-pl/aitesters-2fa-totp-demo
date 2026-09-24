# AI Testers – Automate 2FA and TOTP demo

Materials from the webinar held on **16.09.2026**.

The slides from the webinar are available in [`presentation.pdf`](presentation.pdf).

This repository contains a **Playwright + TypeScript** test automation project, on which during the webinar we switch
on **two-factor authentication (2FA)** for the demo account and automate the **TOTP code** step of the login flow using
the [`otplib`](https://www.npmjs.com/package/otplib) library - while still logging in **through the UI** before every
test.

The tests target the **AI Testers** demo application (`https://aitesters.byst.re`). The project uses the Page Object
Model pattern, Faker.js for test data, Biome for lint/format and Husky + lint-staged as pre-commit hooks.

## Repository structure

| Folder                     | Description                                                                                  |
|----------------------------|----------------------------------------------------------------------------------------------|
| [`1-start/`](1-start/)     | **Starting point** - login fixture fills in username and password only, no 2FA support yet   |
| [`2-finish/`](2-finish/)   | **Finished result** - login flow handles the TOTP step, plus a negative test for a bad code |

Both folders are independent projects - install and run each one separately.

## The problem

The `client` account in the demo app has **2FA enabled**. After submitting username and password, the app shows an
extra step asking for a 6-digit code from an authenticator app. The auto-login fixture in `1-start/` does not know about
this step, so it gets stuck there and every test fails before its body even runs.

## The task

The file [`1-start/PROMPT.md`](1-start/PROMPT.md) contains the prompt we start the work from (in Polish). In short:

- automate the TOTP step inside `LoginPage.login()` using `otplib`, keeping the UI login before each test,
- read the Base32 secret from `config/.env.local` (`DEMO_USER_CLIENT_TOTP_SECRET_KEY`), add it to `demoClientUser`
  and to the CI secrets - never commit it,
- wait for a fresh 30-second window when the current code was already used or is about to expire (the server rejects
  a reused code),
- add a negative test for an invalid code, update `CLAUDE.md` and verify everything with `npm run typecheck`,
  `npm run check` and `npx playwright test`.

Both folders ship a `CLAUDE.md` with project guidelines and a `.mcp.json` enabling the **Playwright MCP** server, so the
task can be run with Claude Code.

## What changes between `1-start` and `2-finish`

- **`otplib`** (`13.5.0`) added to `devDependencies`
- **`src/helpers/totp.ts`** - new `generateTotpCode(secret)` helper that returns the current 6-digit code; if fewer than
  5 seconds are left in the current 30-second window, or the code from this window was already used, it waits for the
  next window first
- **`src/pages/loginPage.ts`** - new locators for the MFA step (`mfaStep`, `inputs.mfaCode`, `buttons.mfaSubmit`,
  `buttons.mfaBack`), a new `submitTotpCode(code)` method, and `login()` now submits credentials, waits for the MFA
  step, generates the code and submits it before waiting for the dashboard
- **`src/types/credentials.ts`** - new `TotpCredentials` type (`Credentials` + `totpSecret`)
- **`src/helpers/users.ts`** - `demoClientUser` reads `DEMO_USER_CLIENT_TOTP_SECRET_KEY`
- **`src/fixtures/pages.ts`** - the `loginViaUi` auto fixture timeout raised to `60_000` ms to cover waiting for a fresh
  TOTP window
- **`src/tests/login.spec.ts`** - new negative test: an invalid code (`000000`) shows an error toast and keeps the user on
  the second factor step
- **`config/.env.local.dist`** and **`.github/workflows/playwright.yml`** - new `DEMO_USER_CLIENT_TOTP_SECRET_KEY`
  variable
- **`CLAUDE.md`** - documents the TOTP helper, the two-factor login flow and the new environment variable

## Installation

1. Clone the repository and enter the folder you want to work with:

```bash
git clone https://github.com/AI-Testers-pl/aitesters-2fa-totp-demo.git
cd aitesters-2fa-totp-demo/1-start   # or 2-finish
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
- `DEMO_USER_CLIENT_TOTP_SECRET_KEY` (`2-finish/` only) - Base32 TOTP secret of the client account

### Getting the TOTP secret

1. Log in to the demo app as the client user and open the `/profile` page.
2. Enable two-factor authentication.
3. Copy the **Manual setup key** shown during setup - that is the Base32 secret for
   `DEMO_USER_CLIENT_TOTP_SECRET_KEY`.

> `config/.env.local` is git-ignored - never commit the secret. For GitHub Actions, add it as a repository secret
> named `DEMO_USER_CLIENT_TOTP_SECRET_KEY`.

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

The full project guidelines (`data-testid` locators, grouping locators in page objects, TypeScript rules, Biome style,
fixtures, environment variables, CI) are described in the `CLAUDE.md` file inside each folder -
[`1-start/CLAUDE.md`](1-start/CLAUDE.md) and [`2-finish/CLAUDE.md`](2-finish/CLAUDE.md).
