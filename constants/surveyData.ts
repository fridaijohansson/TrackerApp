
// surveyQuestions.ts

export const artist_profile = {
  art_medium: {
    question: "What mediums do you prefer to use?",
    options: ["Digital", "Pencil (standard)", "Pencil (colour)", "Ink (standard)", "Ink (colour)"]
  },
  art_style: {
    question: "Which options best describes your style?",
    options: [
      "Cartoon drawing",
      "Line art",
      "Sketching",
      "Surrealism",
      "Abstract",
      "Doodling",
      "Pixel drawing",
      "Realism",
      "Semi-Realism",
      "Expressionism",
      "Minimalist",
      "Concept art",
    ]
  },
  
  art_inspiration: {
    question: "What themes inspire you most?",
    options: [
      "Nature",
      "Fantasy",
      "Sci-fi",
      "Abstract",
      "Portrait",
      "Still life",
      "Character design",
      "Architecture",
      "Cityscape",
      "Any type of Illustrations"
      
    ]
  }
};

export const skill_assessment = {
  experience_level: {
    question: "How would you rate your artistic experience?",
    options: ["Beginner", "Intermediate", "Advanced", "Professional"]
  }
};

export const prompt_setup = {
  prompt_type: {
    question: "What type of prompts interest you?",
    options: [
      "Art class type technical exercises (Technical Mode)",
      "Random descriptions of ideas/scenes (Creative Mode)",
    ]
  },
  prompt_complexity: {
    question: "How detailed do you prefer prompts to be?",
    options: ["Simple", "Moderate", "Complex", "Varying"]
  },
  prompt_time: {
    question: "What do you want the prompt to be for?",
    options: [
      "Quick Sketches (~10 minutes)",
      "Detailed Sketches (~30 minutes)",
      "Drawings (~1 Hour)",
    ]
  }
  
  
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