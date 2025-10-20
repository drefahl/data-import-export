export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, data?: any): void {
    console.log(
      JSON.stringify({
        level: "info",
        context: this.context,
        message,
        data,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  error(message: string, error?: any): void {
    console.error(
      JSON.stringify({
        level: "error",
        context: this.context,
        message,
        error: error?.message || error,
        stack: error?.stack,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  warn(message: string, data?: any): void {
    console.warn(
      JSON.stringify({
        level: "warn",
        context: this.context,
        message,
        data,
        timestamp: new Date().toISOString(),
      }),
    );
  }
}
