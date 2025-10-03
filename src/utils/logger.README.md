# Logger Utility

A clean, structured logging utility for better development experience and easier debugging.

## Features

- 🎨 **Color-coded log levels** with icons
- 📦 **Grouped logs** for related operations
- 🔍 **Smart filtering** by log level
- 📊 **Table output** for structured data
- ⚙️ **Configurable** for different environments
- 🎯 **Type-safe** with TypeScript

## Quick Start

```typescript
import { logger } from "./utils/logger";

// Basic logging
logger.info("Auth", "User logged in");
logger.error("API", "Request failed", errorData);
logger.success("Payment", "Transaction completed");
logger.warn("Validation", "Missing optional field");
logger.debug("Cache", "Hit ratio", { hits: 45, misses: 5 });
```

## API Methods

### Basic Logging

```typescript
logger.debug(category: string, message: string, data?: unknown)
logger.info(category: string, message: string, data?: unknown)
logger.warn(category: string, message: string, data?: unknown)
logger.error(category: string, message: string, data?: unknown)
logger.success(category: string, message: string, data?: unknown)
```

### Grouped Logging

```typescript
// Group related logs
logger.group("API", "User Login Flow", () => {
  logger.info("API", "Validating credentials");
  logger.info("API", "Fetching user data");
  logger.success("API", "Login successful");
});

// Collapsed group (for less important details)
logger.groupCollapsed("Debug", "Request Details", () => {
  logger.debug("API", "Headers", headers);
  logger.debug("API", "Body", body);
});
```

### API Logging

```typescript
// Log API request
logger.apiRequest("/api/login", "POST", { email, password });

// Log API response
logger.apiResponse("/api/login", 200, responseData);
```

### Table Output

```typescript
// Display arrays as tables
logger.table("Users", "Active users list", [
  { id: 1, name: "John", role: "Admin" },
  { id: 2, name: "Jane", role: "User" },
]);
```

## Configuration

```typescript
import { logger } from "./utils/logger";

// Configure logger (typically in your app entry point)
logger.configure({
  enabled: true, // Enable/disable all logging
  level: "info", // Minimum log level: debug | info | warn | error | success
  includeTimestamp: true, // Show timestamps
});

// Production example
logger.configure({
  enabled: false, // Disable in production
});

// Development example
logger.configure({
  enabled: true,
  level: "debug", // Show all logs
  includeTimestamp: true,
});
```

## Log Levels

Logs are filtered based on the configured level:

- `debug`: Shows all logs
- `info`: Shows info, warn, error, success
- `warn`: Shows warn, error, success
- `error`: Shows error, success
- `success`: Shows only success

## Examples

### Before (messy console.logs)

```typescript
console.log("=== STARTING LOGIN ===");
console.log("Email:", email);
console.log("Request URL:", url);
console.log("Headers:", headers);
console.log("Response status:", response.status);
console.log("Response data:", data);
console.log("=== LOGIN COMPLETED ===");
```

### After (clean structured logging)

```typescript
logger.group("Auth", "Login Flow", () => {
  logger.info("Auth", "Starting login", { email });
  logger.debug("Auth", "Request details", { url, headers });
  logger.apiResponse(url, response.status, data);
  logger.success("Auth", "Login completed");
});
```

### API Call Example

```typescript
const response = await fetch(API_ENDPOINTS.LOGIN, {
  method: "POST",
  body: JSON.stringify(credentials),
});

// Instead of multiple console.logs:
logger.apiRequest(API_ENDPOINTS.LOGIN, "POST", credentials);
logger.apiResponse(API_ENDPOINTS.LOGIN, response.status, await response.json());
```

### Error Handling Example

```typescript
try {
  const result = await riskyOperation();
  logger.success("Operation", "Completed successfully", result);
} catch (error) {
  logger.error("Operation", "Failed to complete", error);
}
```

## Benefits

1. **Cleaner Code**: One line instead of multiple console.logs
2. **Better Organization**: Categories and groups make logs easier to find
3. **Visual Clarity**: Colors and icons help distinguish log types
4. **Production Ready**: Easy to disable in production
5. **Debugging**: Structured data makes debugging faster
6. **Consistency**: Same format across your entire app

## Categories

Use meaningful category names for better organization:

- `Auth` - Authentication and authorization
- `API` - API calls and responses
- `Payment` - Payment processing
- `Validation` - Form validation
- `Cache` - Caching operations
- `DB` - Database operations
- `Socket` - WebSocket events
- `UI` - UI-related events

## Output Examples

The logger produces clean, color-coded output:

```
✅ [11:30:45][Auth] Login successful { customerId: "FN41025416", role: "Admin" }
ℹ️  [11:30:45][API] Fetching user details...
📦 [API] POST /api/login
   ℹ️  [API] Request to /api/login
   Request data: { email: "admin@faan.gov.ng" }
✅ [11:30:46][API] Status: 200
   Response data: { ... }
```
