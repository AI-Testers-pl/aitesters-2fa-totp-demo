export type Credentials = {
  username: string;
  password: string;
};

export type TotpCredentials = Credentials & {
  totpSecret: string;
};
