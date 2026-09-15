import { expect, test } from '@fixtures/pages';
import { demoClientUser } from '@helpers/users';

test.describe('Login form tests', () => {
  test.use({ skipAutoLogin: true });

  test('signs in with valid credentials and lands on the dashboard', async ({ loginPage, dashboardPage }) => {
    await loginPage.goTo();
    await loginPage.login();

    await expect(dashboardPage.welcomeTitle).toBeVisible();
    await expect(dashboardPage.userEmail).toBeVisible();
  });

  test('rejects an invalid TOTP code and stays on the second factor step', async ({ loginPage, dashboardPage }) => {
    await loginPage.goTo();
    await loginPage.submit(demoClientUser.username, demoClientUser.password);
    await expect(loginPage.mfaStep).toBeVisible();

    await loginPage.submitTotpCode('000000');

    await expect(loginPage.errorToast.title).toHaveText('Error');
    await expect(loginPage.errorToast.description).toHaveText('Invalid authenticator or recovery code');
    await expect(loginPage.mfaStep).toBeVisible();
    await expect(dashboardPage.welcomeTitle).toBeHidden();
  });
});
