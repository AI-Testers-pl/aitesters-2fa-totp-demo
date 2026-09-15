# AI Testers – Automate 2FA and TOTP demo (start)

**Starting point** of the webinar from **16.09.2026** - this is the project state we begin from.

Test automation project for the **AI Testers** demo application (`https://aitesters.byst.re`).
Written in Playwright + TypeScript, it uses the Page Object Model pattern and Faker.js to
generate test data.

At this stage, tests **log in through the UI form** - the `loginViaUi` auto fixture fills in the
username and password and clicks the sign-in button before each test. The `client` account has
**two-factor authentication (2FA)** enabled, so this flow gets stuck on the step asking for a
6-digit TOTP code. During the webinar we automate that step with the
[`otplib`](https://www.npmjs.com/package/otplib) library.

## The task

The file [`PROMPT.md`](PROMPT.md) contains the prompt we start the work from (in Polish): automate
the TOTP step in `LoginPage.login()` with `otplib` while keeping the UI login, read the Base32
secret from `DEMO_USER_CLIENT_TOTP_SECRET_KEY`, wait for a fresh 30-second window when the current
code was already used or is about to expire, add a negative test for an invalid code and update
`CLAUDE.md`.

> The finished result lives in the `2-finish/` folder.

## Installation

1. Clone the repository and enter this folder:

```bash
git clone https://github.com/AI-Testers-pl/aitesters-2fa-totp-demo.git
cd aitesters-2fa-totp-demo/1-start
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

For the task you also need `DEMO_USER_CLIENT_TOTP_SECRET_KEY` - the Base32 TOTP secret of the client
account (the **Manual setup key** shown when enabling 2FA on the `/profile` page). Never commit it -
`config/.env.local` is git-ignored.

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
TypeScript rules, Biome style, fixtures, CI) are described in the [CLAUDE.md](CLAUDE.md) file.
