/**
 * Logger utility for cleaner, structured logging
 * Provides different log levels and consistent formatting
 */

type LogLevel = "debug" | "info" | "warn" | "error" | "success";

interface LogConfig {
  enabled: boolean;
  level: LogLevel;
  includeTimestamp: boolean;
}

class Logger {
  private config: LogConfig = {
    enabled: import.meta.env.DEV, // Only log in development by default
    level: "debug",
    includeTimestamp: true,
  };

  private readonly colors = {
    debug: "#6B7280", // Gray
    info: "#3B82F6", // Blue
    warn: "#F59E0B", // Orange
    error: "#EF4444", // Red
    success: "#10B981", // Green
  };

  private readonly icons = {
    debug: "🔍",
    info: "ℹ️",
    warn: "⚠️",
    error: "❌",
    success: "✅",
  };

  /**
   * Configure logger settings
   */
  configure(config: Partial<LogConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if logging is enabled for this level
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;

    const levels: LogLevel[] = ["debug", "info", "warn", "error", "success"];
    const configLevelIndex = levels.indexOf(this.config.level);
    const currentLevelIndex = levels.indexOf(level);

    return currentLevelIndex >= configLevelIndex;
  }

  /**
   * Format the log prefix
   */
  private getPrefix(_level: LogLevel, category?: string): string {
    const timestamp = this.config.includeTimestamp
      ? `[${new Date().toLocaleTimeString()}]`
      : "";
    const categoryStr = category ? `[${category}]` : "";
    return `${timestamp}${categoryStr}`.trim();
  }

  /**
   * Generic log method
   */
  private log(
    logLevel: LogLevel,
    category: string,
    message: string,
    data?: unknown
  ): void {
    if (!this.shouldLog(logLevel)) return;

    const prefix = this.getPrefix(logLevel, category);
    const color = this.colors[logLevel];
    const icon = this.icons[logLevel];

    console.log(
      `%c${icon} ${prefix} ${message}`,
      `color: ${color}; font-weight: bold;`
    );

    if (data !== undefined) {
      console.log(data);
    }
  }

  /**
   * Group related logs together
   */
  group(category: string, label: string, fn: () => void): void {
    if (!this.config.enabled) {
      fn();
      return;
    }

    console.group(`📦 [${category}] ${label}`);
    fn();
    console.groupEnd();
  }

  /**
   * Collapsed group
   */
  groupCollapsed(category: string, label: string, fn: () => void): void {
    if (!this.config.enabled) {
      fn();
      return;
    }

    console.groupCollapsed(`📦 [${category}] ${label}`);
    fn();
    console.groupEnd();
  }

  /**
   * Log API request
   */
  apiRequest(endpoint: string, method: string, data?: unknown): void {
    this.group("API", `${method} ${endpoint}`, () => {
      this.info("API", `Request to ${endpoint}`);
      if (data) {
        console.log("Request data:", data);
      }
    });
  }

  /**
   * Log API response
   */
  apiResponse(endpoint: string, status: number, data?: unknown): void {
    const level = status >= 400 ? "error" : "success";
    this.group("API", `Response from ${endpoint}`, () => {
      this.log(level, "API", `Status: ${status}`);
      if (data) {
        console.log("Response data:", data);
      }
    });
  }

  /**
   * Shorthand methods
   */
  debug(category: string, message: string, data?: unknown): void {
    this.log("debug", category, message, data);
  }

  info(category: string, message: string, data?: unknown): void {
    this.log("info", category, message, data);
  }

  warn(category: string, message: string, data?: unknown): void {
    this.log("warn", category, message, data);
  }

  error(category: string, message: string, data?: unknown): void {
    this.log("error", category, message, data);
  }

  success(category: string, message: string, data?: unknown): void {
    this.log("success", category, message, data);
  }

  /**
   * Table output for structured data
   */
  table(category: string, message: string, data: unknown[]): void {
    if (!this.config.enabled) return;

    console.log(
      `%c📊 [${category}] ${message}`,
      `color: ${this.colors.info}; font-weight: bold;`
    );
    console.table(data);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for easy testing/mocking
export default logger;
