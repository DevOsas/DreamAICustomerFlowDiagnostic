const QUESTIONS = [
  {
    id: "lead_source",
    category: "AI Prospecting",
    prompt: "Where do most of your customers currently come from?",
    gap: "Inconsistent AI prospecting and lead source coverage",
    options: {
      "Referrals only": 1,
      "Social media/content": 2,
      "Paid ads": 2,
      "Website/SEO": 2,
      Outreach: 2,
      "Multiple sources": 3,
      "Not sure": 0
    }
  },
  {
    id: "response_speed",
    category: "Instant AI Response",
    prompt: "When a new lead comes in, how fast do you usually respond?",
    gap: "Slow response time without an instant AI responder",
    options: {
      "Within 5 minutes": 3,
      "Within 1 hour": 2,
      "Same day": 1,
      "Next day or later": 0,
      "It depends": 1
    }
  },
  {
    id: "lead_capture",
    category: "AI Lead Capture",
    prompt: "Do you have a system that captures every inquiry?",
    gap: "Weak AI lead capture process",
    options: {
      "Yes, everything is captured": 3,
      "Some are captured": 2,
      "Mostly manual": 1,
      "No clear system": 0
    }
  },
  {
    id: "follow_up",
    category: "AI Follow-Up",
    prompt: "If a lead does not buy or book immediately, what happens next?",
    gap: "Manual or inconsistent AI follow-up",
    options: {
      "Automated follow-up sequence": 3,
      "Manual follow-up": 2,
      "Occasional follow-up": 1,
      Nothing: 0
    }
  },
  {
    id: "booking_conversion",
    category: "AI Booking & Conversion",
    prompt: "Do you have a clear process that moves leads into bookings or sales?",
    gap: "No clear AI booking or conversion path",
    options: {
      "Yes, fully structured": 3,
      "Somewhat structured": 2,
      "Not really": 1,
      "No system": 0
    }
  },
  {
    id: "retention",
    category: "Retention AI",
    prompt: "Do you have a system to bring past customers or old leads back?",
    gap: "No retention or reactivation AI system",
    options: {
      Yes: 3,
      Sometimes: 2,
      "Not really": 1,
      No: 0
    }
  }
];

const RECOMMENDATIONS = {
  "AI Prospecting": "Deploy an AI prospecting agent to reduce dependence on one lead source.",
  "AI Lead Capture": "Install an AI lead capture agent so every inquiry is logged, tagged, and routed instantly.",
  "Instant AI Response": "Deploy an instant AI response agent so new leads hear back in under 60 seconds.",
  "AI Follow-Up": "Install an AI follow-up agent that keeps leads moving after the first inquiry.",
  "AI Booking & Conversion": "Deploy an AI booking and conversion agent to move qualified leads into calls or sales.",
  "Retention AI": "Add retention and reactivation AI agents for past customers and dormant leads."
};

function getResultLevel(percentage) {
  if (percentage >= 84) return "AI Pipeline Optimized";
  if (percentage >= 56) return "AI Pipeline Ready";
  if (percentage >= 28) return "Pipeline at Risk";
  return "High Revenue Leakage Risk";
}

function calculateScore(answers = {}) {
  let totalScore = 0;
  const categoryScores = {};
  const answerDetails = [];
  const detectedGaps = [];

  QUESTIONS.forEach((question) => {
    const selected = answers[question.id];
    const score = Number.isInteger(question.options[selected]) ? question.options[selected] : 0;
    totalScore += score;
    categoryScores[question.category] = {
      score,
      max: 3,
      percentage: Math.round((score / 3) * 100)
    };
    answerDetails.push({
      id: question.id,
      question: question.prompt,
      category: question.category,
      answer: selected || "Not answered",
      score
    });
    if (score <= 1) detectedGaps.push(question.gap);
  });

  const scorePercentage = Math.round((totalScore / 18) * 100);
  const weakest = answerDetails.reduce((risk, item) => (item.score < risk.score ? item : risk), answerDetails[0]);

  return {
    totalScore,
    scorePercentage,
    resultLevel: getResultLevel(scorePercentage),
    categoryScores,
    detectedGaps: detectedGaps.slice(0, 4),
    answerDetails,
    biggestRiskArea: weakest ? weakest.category : "AI Prospecting",
    recommendedFixes: answerDetails
      .filter((item) => item.score <= 2)
      .map((item) => RECOMMENDATIONS[item.category])
      .filter(Boolean)
      .slice(0, 5)
  };
}

module.exports = {
  QUESTIONS,
  calculateScore,
  getResultLevel
};
