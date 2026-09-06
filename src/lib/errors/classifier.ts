export enum ErrorType {
  TRANSIENT = 'TRANSIENT',
  PERMANENT = 'PERMANENT',
  GROUP_LEVEL = 'GROUP_LEVEL',
  SYSTEM_LEVEL = 'SYSTEM_LEVEL'
}

export class ErrorClassifier {
  static classify(error: any): ErrorType {
    const status = error?.status || error?.response?.status;
    const message = error?.message?.toLowerCase() || '';

    // Group level errors (e.g. invalid_grant for OAuth, or 404 for folder missing)
    if (message.includes('invalid_grant') || (status === 404 && message.includes('folder'))) {
      return ErrorType.GROUP_LEVEL;
    }

    // Permanent errors (e.g. 0 byte file, corrupt)
    if (message.includes('corrupt') || message.includes('0 byte')) {
      return ErrorType.PERMANENT;
    }

    // System level errors (e.g. DB connection failed)
    if (message.includes('econnrefused') || message.includes('neon down')) {
      return ErrorType.SYSTEM_LEVEL;
    }

    // Default to Transient for retries (e.g. 429 Rate Limit, 500 Internal Server Error, timeout)
    return ErrorType.TRANSIENT;
  }
}
