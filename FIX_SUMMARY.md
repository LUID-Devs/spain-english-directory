# Fix for "z.getAuthUser is not a function" Error

## Problem
The frontend was throwing `z.getAuthUser is not a function` error when attempting to fetch authenticated user data. This occurred in the `useGetAuthUserQuery` hook in `useApi.ts` and `UserProvider.tsx`.

## Root Cause
The `getAuthUser` method in `apiService.ts` was defined as an arrow function property:
```typescript
getAuthUser = async (userSub: string): Promise<User> => {
  return this.request<User>(`/users/${userSub}`);
};
```

This was inconsistent with all other methods in the class which use standard class method syntax. Arrow function properties can sometimes cause issues with:
1. Class initialization order
2. Minification/bundling processes
3. `this` binding in certain contexts

## Solution
Changed `getAuthUser` from an arrow function property to a standard class method:
```typescript
async getAuthUser(userSub: string): Promise<User> {
  return this.request<User>(`/users/${userSub}`);
}
```

## Files Modified
- `/tmp/task-luid-web/src/services/apiService.ts` - Changed method definition style

## Verification
- Build succeeded: `npm run build` completed without errors
- The minified output still contains the `getAuthUser` method
- No other arrow function properties remain in apiService.ts

## Backend Compatibility
The backend endpoint `/users/:cognitoId` exists in `/tmp/task-luid-backend/src/routes/userRoutes.ts` and is handled by the `getUser` controller, so no backend changes were needed.

## Testing Recommendations
1. Test login flow with a valid user
2. Test page refresh when authenticated
3. Test switching between organizations/workspaces
4. Verify user data is properly loaded on dashboard
