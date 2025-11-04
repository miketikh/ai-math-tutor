# Manual Testing Guide: Story 4.4 - Stuck Detection & Tiered Hints

**Purpose:** Validate stuck detection and hint progression through visual/interactive testing

---

## Prerequisites

1. Dev server running: `npm run dev`
2. Navigate to: http://localhost:3000/test-pages/chat-api-test
3. Open browser console to see server logs (optional)

---

## Test Scenario 1: Student Shows Understanding (Level 0-1)

**Goal:** Verify hints remain vague when student is engaged

**Steps:**
1. Set Problem Context: `Solve: 2x + 5 = 13`
2. Send message: `I think I need to get x by itself on one side`
3. Wait for response
4. Send message: `Should I subtract 5 from both sides?`
5. Wait for response

**Expected Results:**
- AI asks questions like "What do you think?" or "Why would that work?"
- AI does NOT give specific steps
- Responses are encouraging: "Great thinking!", "You're on the right track!"
- Server console shows: `[Stuck Detection] Not stuck - Student just starting or engaged (Level: 0)`

---

## Test Scenario 2: Student Gets Stuck (Level 2)

**Goal:** Verify hints become more specific when student is stuck

**Steps:**
1. Click "Clear History / New Problem"
2. Set Problem Context: `Find the area of a triangle with base 6 and height 10`
3. Send message: `I don't know`
4. Wait for response
5. Send message: `idk`
6. Wait for response
7. Send message: `help`
8. Wait for response

**Expected Results:**
- First 1-2 responses are encouraging but vague
- After 2-3 stuck messages, AI mentions "formula" or "area of triangle"
- AI provides more specific guidance without solving
- Server console shows progression: Level 1 → Level 2
- Example response: "The formula for the area of a triangle involves the base and height..."

---

## Test Scenario 3: Student Very Stuck (Level 3)

**Goal:** Verify concrete hints when student is very stuck

**Steps:**
1. Click "Clear History / New Problem"
2. Set Problem Context: `Solve: x² - 7x + 12 = 0`
3. Send message: `?`
4. Wait for response
5. Send message: `I'm stuck`
6. Wait for response
7. Send message: `help please`
8. Wait for response
9. Send message: `I don't understand`
10. Wait for response

**Expected Results:**
- Responses become progressively more concrete
- By turn 3-4, AI gives specific actionable hint
- Example: "Try factoring this quadratic. You need two numbers that multiply to 12 and add to -7. Can you find them?"
- AI still does NOT give the final answer
- Server console shows: `[Stuck Detection] Very stuck (level 3) - Give concrete actionable hints (Level: 3)`

---

## Test Scenario 4: Stuck Then Progress (Reset)

**Goal:** Verify stuck level resets when student shows understanding

**Steps:**
1. Click "Clear History / New Problem"
2. Set Problem Context: `Simplify: 4x + 3x`
3. Send message: `help`
4. Wait for response
5. Send message: `idk`
6. Wait for response (should be at level 2 now)
7. Send message: `Oh! Since they both have x, I can add 4 + 3 to get 7x!`
8. Wait for response
9. Send message: `What's next?`
10. Wait for response

**Expected Results:**
- First 2 responses show escalating hints (level 2)
- After thoughtful student response, AI recognizes progress
- Response is very encouraging: "Excellent!", "Great job!", "Perfect reasoning!"
- Next question is back to vague Socratic style
- Server console shows level reset: Level 2 → Level 0

---

## Test Scenario 5: Verify Stuck Level Hidden from Frontend

**Goal:** Confirm stuck level is not visible to students

**Steps:**
1. Send any message
2. Open browser DevTools → Network tab
3. Find the POST request to `/api/chat`
4. Click on the request → Response tab
5. Examine the JSON response

**Expected Results:**
- Response contains: `success`, `response` fields
- Response does NOT contain: `stuckLevel`, `hintLevel`, or any mention of "stuck"
- Server console (terminal running npm run dev) shows stuck detection logs
- Browser console shows nothing about stuck level

---

## Visual Indicators Checklist

While testing, verify these UI/UX aspects:

- [ ] Conversation history displays correctly (user right, AI left)
- [ ] Messages are readable and properly formatted
- [ ] No layout issues or overlapping text
- [ ] Loading states work (button shows "Sending...")
- [ ] Input clears after sending message
- [ ] Scroll position stays at bottom of conversation
- [ ] No console errors in browser
- [ ] Server logs show stuck detection levels

---

## Expected Server Console Output

You should see logs like this in your terminal:

```
[Stuck Detection] Not stuck - Student just starting or engaged (Level: 0)
[Stuck Detection] Slightly uncertain - Use vague hints (Level: 1)
[Stuck Detection] Stuck - Provide more specific guidance (Level: 2)
[Stuck Detection] Very stuck (level 3) - Give concrete actionable hints (Level: 3)
[Stuck Detection] Not stuck - Student just starting or engaged (Level: 0)  # After reset
```

---

## Success Criteria

All scenarios should demonstrate:
1. ✅ Stuck level increases with repeated unhelpful responses
2. ✅ Stuck level resets when student shows understanding
3. ✅ Hints progress from vague → specific → concrete
4. ✅ AI never gives final answers, even at level 3
5. ✅ Stuck level visible in server logs only
6. ✅ Stuck level NOT in API response to client

---

## Troubleshooting

**If hints don't escalate:**
- Check server console for stuck detection logs
- Verify you're sending multiple stuck messages in sequence
- Try shorter messages like "?", "idk", "help"

**If API errors occur:**
- Check OpenAI API key is set in `.env.local`
- Verify dev server is running
- Check network tab for error details

**If stuck level appears in frontend:**
- This is a BUG - stuck level should be server-side only
- Check API response in Network tab
- Report the issue

---

## Automated Testing

For automated validation, run:
```bash
node test-stuck-detection.js
```

Expected output: `✓ All tests passed! Story 4.4 is working correctly.`

---

## Next Steps After Testing

If all tests pass:
1. Story 4.4 is complete ✅
2. Ready to integrate with full chat interface in Epic 6
3. Can proceed to Story 4.5 (Response Validation) or Epic 5 (Interactive Canvas)

---

**Testing Completed By:** _________________
**Date:** _________________
**All Scenarios Passed:** [ ] Yes [ ] No
**Notes:**
