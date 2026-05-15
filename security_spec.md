# Security Specification - Sáng Kiến Việt

## Data Invariants
1. **Profiles**: A profile document ID must match the user's UID. Only the user can create/update their own profile.
2. **Initiatives**:
   - `authorId` must match `request.auth.uid`.
   - `createdAt` must be server-assigned.
   - `likesCount` must be system-managed or validated.
   - Users can only delete their own initiatives.
3. **Comments**:
   - `authorId` must match `request.auth.uid`.
   - `initiativeId` must exist.

## The Dirty Dozen Payloads (Target: DENY)
1. **Identity Spoofing**: Attempt to create a profile for another UID.
2. **Profile Hijacking**: Attempt to update another user's profile.
3. **Initiative Forgery**: Create an initiative with someone else's `authorId`.
4. **Timestamp Manipulation**: Set a custom `createdAt` date in the past.
5. **Unauthorized Edit**: Edit an initiative without being the author.
6. **Shadow Fields**: Add `isVerified: true` to a profile.
7. **Resource Poisoning**: Use a 1MB string as a category or title.
8. **Malicious ID**: Use illegal characters in an ID.
9. **Comment Impersonation**: Create a comment as another user.
10. **Global Read Leak**: Authenticated user trying to list all profiles (should be restricted or limited to non-PII).
11. **State Shortcut**: Changing status directly to 'published' without meeting system criteria (if we had a review process).
12. **Likes Inflation**: Directly updating `likesCount` to 999999.

## Verification
Rules will be tested via firestore rules emulator (conceptually) or ESLint.
