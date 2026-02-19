# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - Header Buttons Visible After Auth State Loaded
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases where localStorage has valid auth data but buttons are not visible on initial render
  - Test that when Navbar renders with valid localStorage data (auth_token, user_role, user_email present), buttons are visible once authStatus is 'authenticated' and currentRole/currentEmail are populated
  - Test scenarios: post-login render, route change, hard refresh simulation, rapid navigation
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found (e.g., "Navbar renders with currentRole=null despite localStorage having user_role='operator'", "Buttons hidden on initial render even with valid auth data")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Unauthenticated and Role-Based Visibility
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (unauthenticated users, basic users, operator users with stable state)
  - Write property-based tests capturing observed behavior patterns:
    - Unauthenticated users (no auth_token) see no buttons
    - Basic users (role='basic') see only Logout button, no Admin badge
    - Operator users (role='operator') see both Admin badge and Logout button
    - Logout functionality clears state and redirects to /login
  - Property-based testing generates many test cases for stronger guarantees across different auth states and role combinations
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix for auth header button visibility race condition

  - [x] 3.1 Implement the fix in Navbar component
    - Add authStatus state variable to track authentication loading state: `const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')`
    - Initialize to 'loading' to prevent premature rendering of buttons
    - Update useEffect to set authStatus to 'authenticated' when currentRole and currentEmail are successfully loaded from localStorage
    - Update useEffect to set authStatus to 'unauthenticated' when no auth_token is found in localStorage
    - Modify conditional rendering logic to check authStatus before rendering buttons: `{authStatus === 'authenticated' && currentRole && (<>...</>)}`
    - Ensure state updates are synchronized (set authStatus only after currentRole and currentEmail are set)
    - _Bug_Condition: isBugCondition(renderContext) where localStorage has valid auth data but renderContext.currentRole/currentEmail are null and authStatus is 'loading' or undefined_
    - _Expected_Behavior: Buttons visible once authStatus === 'authenticated' and currentRole/currentEmail are populated (from Correctness Properties - Property 1)_
    - _Preservation: Unauthenticated users see no buttons, basic users see only Logout button, operator users see both buttons (from Correctness Properties - Property 2)_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Header Buttons Visible After Auth State Loaded
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Unauthenticated and Role-Based Visibility
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions in unauthenticated behavior, role-based visibility, logout functionality)

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
