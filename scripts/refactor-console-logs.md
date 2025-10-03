# Console.log Refactoring Guide

This guide shows how to systematically replace console.logs with the logger utility.

## Quick Reference

### Basic Replacements

```typescript
// Before
console.log("Message", data);
// After
logger.info("Category", "Message", data);

// Before
console.error("Error message", error);
// After
logger.error("Category", "Error message", error);

// Before
console.warn("Warning");
// After
logger.warn("Category", "Warning");
```

### Common Patterns

#### API Requests

```typescript
// Before
console.log("=== STARTING REQUEST ===");
console.log("URL:", url);
console.log("Method:", method);
console.log("Body:", body);
console.log("Response:", response);
console.log("=== REQUEST COMPLETED ===");

// After
logger.group("API", `${method} ${url}`, () => {
  logger.info("API", "Request", { method, body });
  logger.success("API", "Response", response);
});
```

#### Success/Error Flow

```typescript
// Before
console.log("Operation successful!");
console.log("Result:", result);

// After
logger.success("Operation", "Completed successfully", result);

// Before
console.error("Operation failed:", error);

// After
logger.error("Operation", "Failed", error);
```

#### Debug Information

```typescript
// Before
console.log("Debug info:", debugData);

// After
logger.debug("Component", "Debug info", debugData);
```

## Category Guidelines

- **Auth** - Authentication & authorization
- **API** - All API calls
- **Payment** - Payment processing
- **Wallet** - Wallet operations
- **User** - User management
- **Service** - Service booking/operations
- **Validation** - Form validation
- **UI** - UI state changes
- **Data** - Data transformations

## Files to Refactor

1. ✅ AuthContext.tsx (login function refactored)
2. ⏳ AuthContext.tsx (remaining functions)
3. ⏳ DashboardPage.tsx
4. ⏳ ServicesPage.tsx
5. ⏳ RegisterPage.tsx
6. ⏳ CustomersPage.tsx
7. ⏳ ProfilePage.tsx
8. ⏳ PaymentPage.tsx
9. ⏳ Other components

## Priority Functions to Refactor

### High Priority (User-facing)

- Login/Logout
- Fund Wallet
- Make Payment
- User Registration
- Profile Updates

### Medium Priority (Admin)

- Customer Management
- Transaction History
- Dashboard Stats

### Low Priority

- UI interactions
- Debug statements
- Development-only logs
