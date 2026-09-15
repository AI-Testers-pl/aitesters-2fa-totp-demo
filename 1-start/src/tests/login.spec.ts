import { expect, test } from '@fixtures/pages';

test.describe('Login form tests', () => {
  test.use({ skipAutoLogin: true });

  test('signs in with valid credentials and lands on the dashboard', async ({ loginPage, dashboardPage }) => {
    await loginPage.goTo();
    await loginPage.login();

    await expect(dashboardPage.welcomeTitle).toBeVisible();
    await expect(dashboardPage.userEmail).toBeVisible();
  });
});
