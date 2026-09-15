import { generate } from 'otplib';

const TOTP_PERIOD_SECONDS = 30;
const MIN_SECONDS_LEFT = 5;

let lastUsedTimeStep: number | undefined;

const currentEpochSeconds = (): number => Math.floor(Date.now() / 1000);

const toTimeStep = (epochSeconds: number): number => Math.floor(epochSeconds / TOTP_PERIOD_SECONDS);

const sleep = (milliseconds: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function generateTotpCode(secret: string): Promise<string> {
  const now = currentEpochSeconds();
  const secondsLeft = TOTP_PERIOD_SECONDS - (now % TOTP_PERIOD_SECONDS);

  if (secondsLeft < MIN_SECONDS_LEFT || toTimeStep(now) === lastUsedTimeStep) {
    await sleep(secondsLeft * 1000);
  }

  const epoch = currentEpochSeconds();
  lastUsedTimeStep = toTimeStep(epoch);

  return generate({ secret, epoch });
}
