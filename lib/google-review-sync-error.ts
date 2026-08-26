import "server-only";

export class GoogleReviewSyncError extends Error {
  readonly diagnosticCode: string;
  readonly requiresReconnect: boolean;

  constructor(
    message: string,
    {
      diagnosticCode = "sync_unknown_failed",
      requiresReconnect = false,
    }: {
      diagnosticCode?: string;
      requiresReconnect?: boolean;
    } = {},
  ) {
    super(message);
    this.name = "GoogleReviewSyncError";
    this.diagnosticCode = diagnosticCode;
    this.requiresReconnect = requiresReconnect;
  }
}
