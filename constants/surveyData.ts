// surveyQuestions.ts

export const artist_profile = {
  art_style: {
    question: "Which options best describes your style?",
    options: [
      "Cartoon drawing",
      "Line art",
      "Sketching",
      "Illustration",
      "Surrealism",
      "Abstract",
      "Doodling",
      "Digital art",
      "Pixel drawing",
      "Realism",
      "Expressionism",
      "Minimalist",
      "Concept art",
      "Pop art"
    ]
  },
  art_medium: {
    question: "What mediums do you prefer?",
    options: ["Digital", "Pencil", "Ink"]
  },
  art_inspiration: {
    question: "What themes inspire you most?",
    options: [
      "Nature",
      "Urban",
      "Fantasy",
      "Sci-fi",
      "Abstract",
      "Portrait",
      "Still life",
      "Character design"
    ]
  }
};

export const skill_assessment = {
  experience_level: {
    question: "How would you rate your artistic experience?",
    options: ["Beginner", "Intermediate", "Advanced", "Professional"]
  },
  artistic_goal: {
    question: "What's your primary goal?",
    options: [
      "Hobby",
      "Professional development",
      "Building portfolio",
      "Learning new skills"
    ]
  }
};

export const prompt_setup = {
  prompt_complexity: {
    question: "How detailed do you prefer prompts to be?",
    options: ["Simple", "Moderate", "Complex", "Varying"]
  },
  prompt_type: {
    question: "What type of prompts interest you?",
    options: [
      "Technical exercises",
      "Creative challenges",
      "Subject matter",
      "Style exploration"
    ]
  },
  
  
};

export const notifications_setup = {
  
  notification_time: {
    question: "Would you like notifications and when?",
    options: [
      "Early morning (7am)",
      "Late morning (11am)",
      "early afternoon (2pm)",
      "Late afternoon (5pm)",
      "Early evening (7pm)",
      "Late evening (10pm)"
    ]
  }
};

// Optional: Export all categories in a single object if needed
export const allCategories = {
  artist_profile,
  skill_assessment,
  prompt_setup
};