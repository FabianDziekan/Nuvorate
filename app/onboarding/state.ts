export type OnboardingState = {
  error?: string;
  fieldErrors?: Partial<
    Record<"name" | "industry" | "city" | "googleReviewUrl", string>
  >;
};

export const initialOnboardingState: OnboardingState = {};
