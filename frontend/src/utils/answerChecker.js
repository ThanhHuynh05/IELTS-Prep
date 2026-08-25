export function checkAnswer(userAnswer, correctAnswer) {
  if (!userAnswer || !correctAnswer) return false;
  
  const u = userAnswer.trim().toLowerCase();
  const c = correctAnswer.trim().toLowerCase();

  if (u === c) return true;

  // Split by '/' to handle multiple possible answers (e.g. "car / auto")
  const correctParts = c.split('/').map(p => p.trim());
  if (correctParts.includes(u)) return true;

  // Handle optional parts in parentheses (e.g. "(the) Animal Park")
  for (const part of correctParts) {
    if (part.includes('(') && part.includes(')')) {
      const withOptional = part.replace(/[()]/g, '').replace(/\s+/g, ' ').trim();
      const withoutOptional = part.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
      
      if (u === withOptional || u === withoutOptional) {
        return true;
      }
    }
  }

  return false;
}

