"use client";

type Info = { solutions: string[] };
const MITIGATION_METHODS: Record<string, Info> = {
  "Timeout": {
    solutions: [
      "Advise patients to wait 5-10 minutes before resubmitting their requests",
      "For urgent cases, call our provider hotline to process requests manually",
      "Break complex multi-service requests into separate individual submissions",
      "Schedule non-urgent benefit verifications during off-peak hours (early morning or late evening)",
    ],
  },
  "Network": {
    solutions: [
      "Instruct patients to check their internet connection and refresh the page",
      "Provide alternative access methods like your office phone or fax for urgent requests",
      "Keep backup contact numbers for our provider services when online systems are down",
      "Monitor our system status page and inform patients of known outages",
    ],
  },
  "Auth": {
    solutions: [
      "Help patients reset their passwords using the 'Forgot Password' option",
      "Verify that patients are using their current member ID and personal information",
      "For elderly patients, assist with clearing browser data or use incognito mode",
      "Contact our provider support line to verify patient eligibility on their behalf",
    ],
  },
  "Validation": {
    solutions: [
      "Double-check patient information against their insurance cards for accuracy",
      "Verify recent changes like name changes, address updates, or new dependents",
      "Ensure dates of birth and member IDs are entered exactly as shown on insurance cards",
      "Submit a member information update request if patient details have changed recently",
    ],
  },
  "Server": {
    solutions: [
      "Inform patients that system issues are temporary and to try again in 15-30 minutes",
      "Use our provider portal's offline forms for urgent prior authorization requests",
      "Call our provider services line to process time-sensitive requests manually",
      "Subscribe to our provider alerts to receive notifications about planned maintenance",
    ],
  },
};

export function ErrorIndexBox() {
  return (
    <div className="space-y-2 text-sm">
      {Object.entries(MITIGATION_METHODS).map(([key, info]) => (
        <div key={key} className="rounded-md border p-3 whitespace-normal break-words">
          <div className="font-medium">{key}</div>
          <ul className="mt-2 list-disc pl-5 text-gray-700">
            {info.solutions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}


