export async function gradeWriting(taskType, question, essay) {
  const systemPrompt = `You are an expert IELTS examiner. Grade the following ${taskType} response strictly according to official IELTS band descriptors. Return ONLY a JSON object with this exact shape:
{
  "overallBand": <number 0-9>,
  "criteria": {
    "taskAchievement": { "band": <number 0-9>, "feedback": "<detailed feedback>" },
    "coherenceCohesion": { "band": <number 0-9>, "feedback": "<detailed feedback>" },
    "lexicalResource": { "band": <number 0-9>, "feedback": "<detailed feedback>" },
    "grammaticalRange": { "band": <number 0-9>, "feedback": "<detailed feedback>" }
  },
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "errors": [
    {
      "type": "<'grammar' or 'vocabulary'>",
      "originalText": "<exact incorrect text from the user's essay>",
      "correction": "<the correct word or phrase>",
      "explanation": "<why it is wrong and how to fix it, with a recommendation for a better sentence>"
    }
  ],
  "sampleAnswer": "<a complete, well-written Band 7.0 sample response to the question. It MUST be full length (at least 250 words for Task 2) and MUST include clear paragraph breaks using \\n\\n>"
}`;

  const response = await fetch("/api/evaluate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `IELTS Question: ${question}\n\nStudent Essay:\n${essay}` }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

export async function gradeSpeaking(part, prompt, transcript) {
  const systemPrompt = `You are an expert IELTS speaking examiner. Grade the transcript below for Speaking ${part}. Return ONLY a JSON object:
{
  "overallBand": <number 0-9>,
  "criteria": {
    "fluencyCoherence": { "band": <number 0-9>, "feedback": "<detailed feedback>" },
    "lexicalResource": { "band": <number 0-9>, "feedback": "<detailed feedback>" },
    "grammaticalRange": { "band": <number 0-9>, "feedback": "<detailed feedback>" },
    "pronunciation": { "band": <number 0-9>, "feedback": "<detailed feedback>" }
  },
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "betterPhrase": "<suggest one improved phrase from the transcript>",
  "errors": [
    {
      "type": "<'grammar' or 'pronunciation'>",
      "originalText": "<exact incorrect text from the user's transcript>",
      "correction": "<the correct word or phrase>",
      "explanation": "<why it is wrong and how to fix it>"
    }
  ]
}`;

  const response = await fetch("/api/evaluate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Speaking Prompt (${part}): ${prompt}\n\nTranscript:\n${transcript}` }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
