/**
 * Kid-friendly error messages for middle school students
 * Translates technical errors into engaging, age-appropriate messages
 */

/**
 * Converts technical error messages into kid-friendly ones
 * @param error - The error object or message
 * @returns A friendly, encouraging message appropriate for middle schoolers
 */
export function getKidFriendlyErrorMessage(error: Error | string | unknown): string {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Timeout errors
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    const messages = [
      "Hmm, that took a bit longer than expected! Let's try that again. 🔄",
      "Oops! I was thinking too hard and lost track of time. Want to try once more?",
      "My brain needs a quick refresh! Hit send again and I'll be ready. ⚡",
      "That one got stuck in the gears! Let's give it another shot. 🎯",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Network errors
  if (lowerMessage.includes('network') || lowerMessage.includes('connection') || lowerMessage.includes('enotfound')) {
    const messages = [
      "Looks like my internet hiccuped! Check your connection and let's try again. 📡",
      "Uh oh, I lost my connection for a sec! Mind trying that one more time?",
      "Internet gremlins strike again! Give it another go when you're ready. 🌐",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Rate limit errors
  if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests') || lowerMessage.includes('busy')) {
    const messages = [
      "Whoa, lots of students asking questions right now! Give me just a moment and try again. ⏱️",
      "I'm helping a bunch of students at once! Wait a few seconds and I'll be all yours. 🙋",
      "High five for being eager to learn! I just need a quick breather - try again in a moment. ✋",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Invalid input / validation errors
  if (lowerMessage.includes('invalid') || lowerMessage.includes('validation')) {
    const messages = [
      "Hmm, something looked a bit odd with that input. Can you try rephrasing?",
      "I'm having trouble understanding that format. Want to try saying it differently?",
      "That didn't quite make sense to me. No worries - let's try again! 💭",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Server/config errors
  if (lowerMessage.includes('server') || lowerMessage.includes('configuration') || lowerMessage.includes('authentication')) {
    return "Oops! Something's not quite right on my end. Let your teacher know if this keeps happening! 🛠️";
  }

  // API key or auth errors
  if (lowerMessage.includes('api key') || lowerMessage.includes('unauthorized')) {
    return "Hmm, I need my teacher to check something on my end. Let them know I'm having trouble! 🔑";
  }

  // JSON parsing errors
  if (lowerMessage.includes('json') || lowerMessage.includes('parse')) {
    const messages = [
      "Whoops, I got a bit tongue-tied there! Let's try that again. 😅",
      "My wires got crossed for a sec! Hit send one more time?",
      "I fumbled that response! Want to give it another shot?",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Generic fallback - still friendly and encouraging
  const genericMessages = [
    "Oops! Something unexpected happened. No worries though - let's try again! 🎲",
    "Hmm, I hit a little snag there. Want to give it another try?",
    "Well that was weird! I'm ready to go again when you are. 🚀",
    "My bad! Something glitched. Let's take another shot at it! ⭐",
  ];
  return genericMessages[Math.floor(Math.random() * genericMessages.length)];
}

/**
 * Check if an error is temporary and worth retrying
 * @param error - The error to check
 * @returns true if the user should retry, false if they need help
 */
export function isRetryableError(error: Error | string | unknown): boolean {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Temporary issues that users can retry
  const retryablePatterns = ['timeout', 'network', 'connection', 'rate limit', 'busy', 'json', 'parse'];

  return retryablePatterns.some(pattern => lowerMessage.includes(pattern));
}

/**
 * Get a helpful suggestion based on the error type
 * @param error - The error to analyze
 * @returns A helpful next step suggestion
 */
export function getErrorSuggestion(error: Error | string | unknown): string | null {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
    return "Check that you're connected to the internet.";
  }

  if (lowerMessage.includes('rate limit') || lowerMessage.includes('busy')) {
    return "Wait about 10-30 seconds before trying again.";
  }

  if (lowerMessage.includes('timeout')) {
    return "If this keeps happening, try a simpler question first.";
  }

  return null;
}
