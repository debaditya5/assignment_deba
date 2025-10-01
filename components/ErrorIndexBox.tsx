"use client";

type Info = { reason: string; solutions: string[] };
const EXPLANATIONS: Record<string, Info> = {
  "Eligibility API": {
    reason: "The system couldn't check if someone is covered by their insurance. This usually happens when the insurance company's computer is slow or temporarily unavailable.",
    solutions: [
      "Try checking again automatically if the first attempt fails",
      "Make sure we're asking the insurance company in the right format",
      "Have a backup plan when the insurance company's system is down",
    ],
  },
  "Auth API": {
    reason: "The system couldn't verify if someone is allowed to access their benefits. This might be because the request took too long or was formatted incorrectly.",
    solutions: [
      "Double-check that all required information is provided correctly",
      "Give the system more time to respond when it's busy",
      "Remember previous successful requests to avoid asking the same question twice",
    ],
  },
  "LLM Timeout": {
    reason: "The AI assistant took too long to understand and respond to a question. This happens when the question is complex or the system is overloaded.",
    solutions: [
      "Break down complex questions into simpler parts",
      "Give the AI more time for important questions, less time for simple ones",
      "Remember common answers so we don't have to think about them every time",
    ],
  },
  "Data Mapping": {
    reason: "The system couldn't understand the information because different parts use different formats. It's like trying to read a document written in a different language.",
    solutions: [
      "Create a translation guide for common insurance companies",
      "Test the translation with different insurance companies regularly",
      "Show clear error messages when information doesn't match what we expect",
    ],
  },
};

export function ErrorIndexBox() {
  return (
    <div className="card overflow-visible">
      <div className="card-title">Error index</div>
      <div className="mt-2 space-y-2 text-sm">
        {Object.entries(EXPLANATIONS).map(([key, info]) => (
          <div key={key} className="rounded-md border p-3 whitespace-normal break-words">
            <div className="font-medium">{key}</div>
            <div className="text-gray-600 leading-relaxed">{info.reason}</div>
            <ul className="mt-2 list-disc pl-5 text-gray-700">
              {info.solutions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}


