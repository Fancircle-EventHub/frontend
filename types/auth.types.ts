export type AuthTokenResponse<TUser, K extends string> = {
  token: string;
} & Record<K, TUser>;

export type VerifyOtpPayload = {
  email: string;
  otp: string;
  remember?: boolean;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  email: string;
  otp: string;
  password: string;
  password_confirmation: string;
};
