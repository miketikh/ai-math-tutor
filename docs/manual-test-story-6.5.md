# Manual Test Plan - Story 6.5: New Problem Button

**Test Date:** 2025-11-03
**Story:** Add "New Problem" Button to Reset Session
**Tester:** [Your Name]

---

## Pre-Test Setup

1. Ensure dev server is running: `npm run dev`
2. Navigate to: `http://localhost:3000/test-pages/new-problem-test`
3. Have both light and dark mode ready for testing

---

## Test Cases

### Test Case 1: Button Visibility
**Objective:** Verify the "New Problem" button is visible in the header

**Steps:**
1. Navigate to any page (main page, test pages)
2. Look at the header (top of page)

**Expected Results:**
- [ ] "New Problem" button is visible in the top-right of the header
- [ ] Button has proper styling (blue background, white text)
- [ ] Button has hover effect when mouse hovers over it

---

### Test Case 2: Modal Appearance
**Objective:** Verify confirmation modal appears when button is clicked

**Steps:**
1. Click the "New Problem" button in header
2. Observe the modal that appears

**Expected Results:**
- [ ] Modal appears with semi-transparent dark overlay
- [ ] Modal displays title: "Start a new problem?"
- [ ] Modal displays message: "Current progress will be lost. This will clear your conversation history and reset the session."
- [ ] Modal has two buttons: "Cancel" and "Start New Problem"
- [ ] Background is dimmed/blurred

---

### Test Case 3: Cancel Functionality
**Objective:** Verify Cancel button preserves conversation

**Steps:**
1. On test page, click "Add Test Messages" to populate conversation
2. Verify messages appear in the conversation history
3. Click "New Problem" button
4. Click "Cancel" button in the modal

**Expected Results:**
- [ ] Modal closes
- [ ] All messages are still visible in conversation history
- [ ] Message count remains the same (should be 4)
- [ ] No visual changes to the page

---

### Test Case 4: Confirm Functionality
**Objective:** Verify "Start New Problem" clears conversation

**Steps:**
1. On test page, click "Add Test Messages" to populate conversation
2. Verify messages appear (should show 4 messages)
3. Click "New Problem" button
4. Click "Start New Problem" button in the modal

**Expected Results:**
- [ ] Modal closes
- [ ] All messages are cleared from conversation history
- [ ] Message count shows 0
- [ ] Conversation area shows "No messages yet" message

---

### Test Case 5: onReset Callback
**Objective:** Verify optional onReset callback works

**Steps:**
1. On test page, type some text in the "Local State" input field
2. Click "Add Test Messages" to populate conversation
3. Click the "New Problem" button on the page (not in header)
4. Click "Start New Problem"

**Expected Results:**
- [ ] Modal closes
- [ ] Conversation is cleared
- [ ] Local state input is cleared (empty)
- [ ] Green success message appears: "Session reset successfully! Conversation cleared."
- [ ] Success message disappears after 3 seconds

---

### Test Case 6: Background Click
**Objective:** Verify clicking outside modal closes it

**Steps:**
1. Click "New Problem" button to open modal
2. Click on the dark overlay area (outside the white modal box)

**Expected Results:**
- [ ] Modal closes
- [ ] No changes to conversation or state

---

### Test Case 7: Escape Key
**Objective:** Verify Escape key closes modal

**Steps:**
1. Click "New Problem" button to open modal
2. Press the Escape key on keyboard

**Expected Results:**
- [ ] Modal closes
- [ ] No changes to conversation or state

---

### Test Case 8: Dark Mode
**Objective:** Verify button and modal work in dark mode

**Steps:**
1. Switch to dark mode (use system preferences or browser extension)
2. Observe the "New Problem" button
3. Click the button to open modal
4. Observe modal appearance

**Expected Results:**
- [ ] Button has appropriate dark mode styling
- [ ] Modal has dark background (not white)
- [ ] Text is readable in dark mode
- [ ] All colors are appropriate for dark mode

---

### Test Case 9: Keyboard Navigation
**Objective:** Verify keyboard accessibility

**Steps:**
1. Click "New Problem" button to open modal
2. Use Tab key to navigate between buttons
3. Press Enter on "Cancel" button
4. Open modal again
5. Tab to "Start New Problem" button
6. Press Enter

**Expected Results:**
- [ ] Tab key moves focus between Cancel and Confirm buttons
- [ ] Focused button has visible focus ring
- [ ] Enter key activates the focused button
- [ ] "Start New Problem" button is focused by default when modal opens

---

### Test Case 10: Multiple Resets
**Objective:** Verify multiple consecutive resets work correctly

**Steps:**
1. Add test messages
2. Click "New Problem" and confirm
3. Add test messages again
4. Click "New Problem" and confirm
5. Repeat one more time

**Expected Results:**
- [ ] Each reset clears the conversation successfully
- [ ] No errors in console
- [ ] Modal functions correctly each time
- [ ] No memory leaks or performance issues

---

## Acceptance Criteria Verification

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | "New Problem" button in header | [ ] Pass / [ ] Fail | |
| 2 | Click shows confirmation message | [ ] Pass / [ ] Fail | |
| 3 | Confirm clears conversation history | [ ] Pass / [ ] Fail | Canvas/image deferred to Epic 5 |
| 4 | Cancel preserves current session | [ ] Pass / [ ] Fail | |
| 5 | After reset, ready for new problem | [ ] Pass / [ ] Fail | |
| 6 | Visual feedback on successful reset | [ ] Pass / [ ] Fail | Via onReset callback |

---

## Cross-Browser Testing (Optional)

Test in multiple browsers if available:

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari

---

## Mobile Testing (Optional)

If testing on mobile device:

- [ ] Button visible on mobile
- [ ] Modal displays correctly on small screens
- [ ] Touch interactions work correctly

---

## Issues Found

Document any issues found during testing:

| Issue # | Description | Severity | Steps to Reproduce |
|---------|-------------|----------|-------------------|
| | | | |

---

## Notes

- Test page URL: `http://localhost:3000/test-pages/new-problem-test`
- Automated tests: `node test-scripts/test-new-problem-button.js`
- Implementation summary: `/docs/summaries/story-6.5-implementation.md`

---

## Sign-Off

**Tester Name:** ___________________________

**Date:** ___________________________

**Result:** [ ] All tests passed [ ] Issues found (see above)
