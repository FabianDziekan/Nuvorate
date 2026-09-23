export type OnboardingState = {
  error?: string;
  fieldErrors?: Partial<
    Record<"name" | "industry" | "city", string>
  >;
};

export const initialOnboardingState: OnboardingState = {};
