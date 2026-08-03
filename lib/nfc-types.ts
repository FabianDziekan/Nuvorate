export type NfcTagActionState = {
  createdTag?: {
    name: string;
    publicUrl: string;
  };
  error?: string;
  success?: string;
};
