import { generateTotpCode } from '@helpers/totp';
import { demoClientUser } from '@helpers/users';
import { BasePage } from '@pages/basePage';
import type { Locator, Page } from '@playwright/test';
import type { TotpCredentials } from '@typings/credentials';

export class LoginPage extends BasePage {
  readonly welcomeTitle: Locator;
  readonly mfaStep: Locator;

  readonly inputs: {
    readonly username: Locator;
    readonly password: Locator;
    readonly mfaCode: Locator;
  };

  readonly buttons: {
    readonly signIn: Locator;
    readonly forgotPassword: Locator;
    readonly register: Locator;
    readonly mfaSubmit: Locator;
    readonly mfaBack: Locator;
  };

  readonly errorToast: {
    readonly title: Locator;
    readonly description: Locator;
  };

  constructor(page: Page) {
    super(page, '/login');

    this.welcomeTitle = page.getByTestId('home-welcome-title');
    this.mfaStep = page.getByTestId('login-mfa-step');

    this.inputs = {
      username: page.getByTestId('login-username-input'),
      password: page.getByTestId('login-password-input'),
      mfaCode: page.getByTestId('login-mfa-code-input'),
    };

    this.buttons = {
      signIn: page.getByTestId('login-submit-button'),
      forgotPassword: page.getByTestId('login-forgot-link'),
      register: page.getByTestId('login-register-link'),
      mfaSubmit: page.getByTestId('login-mfa-submit-button'),
      mfaBack: page.getByTestId('login-mfa-back-button'),
    };

    this.errorToast = {
      title: page.getByTestId('toast-title'),
      description: page.getByTestId('toast-description'),
    };
  }

  async submit(username: string, password: string): Promise<void> {
    await this.inputs.username.fill(username);
    await this.inputs.password.fill(password);
    await this.buttons.signIn.click();
  }

  async submitTotpCode(code: string): Promise<void> {
    await this.inputs.mfaCode.fill(code);
    await this.buttons.mfaSubmit.click();
  }

  async login({ username, password, totpSecret }: TotpCredentials = demoClientUser): Promise<void> {
    await this.submit(username, password);
    await this.mfaStep.waitFor();

    const code = await generateTotpCode(totpSecret);

    await this.submitTotpCode(code);
    await this.welcomeTitle.waitFor();
  }
}
