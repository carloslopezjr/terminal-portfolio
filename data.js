// Shared data file for terminal-portfolio
// Keep project and profile arrays here as the single source of truth.
window.PROJECTS = [
  {
    id: 'project1',
    title: 'VidScore Pro',
    description: 'Easily score your short-form content to understand where it can improve to boost social media engagement.',
    repo: 'https://github.com/carloslopezjr/VidScore-Pro',
    demo: '[DEMO PENDING]'
  },
  {
    id: 'project2',
    title: 'Schedule-to-calendar-heb',
    description: 'Without no automated way to integrate your H-E-B work schedule to Google Calendar, this project fixes that.',
    repo: 'https://github.com/carloslopezjr/schedule-to-calendar-heb',
    demo: '[DEMO PENDING]'
  },
  {
    id: 'project3',
    title: 'StreamPilot',
    description: 'Coupled multiple APIs into one to automate pre-stream production setups like stream title, description, thumbnail, and selection of Leetcode problems.',
    repo: 'https://github.com/carloslopezjr/StreamPilot',
    demo: '[DEMO PENDING]'
  },
  {
    id: 'project4',
    title: 'Door.ai',
    description: "Solves specific problem for UTSA Rowdy Creator members who always have to knock on door to join meetings which wasn't efficient.",
    repo: 'https://github.com/carloslopezjr/Door.Ai',
    demo: '[DEMO PENDING]'
  }
];

window.EXPERIENCES = [
  {
    company: 'Visa Inc',
    title: 'Software Engineer Intern',
    period: 'May 2025 - August 2025',
    bullets: [
      'Developed an intelligent agent workflow using LangGraph to automate anomaly interpretation and rule generation, reducing time from anomaly detection to mitigation from hours/days to near real-time.',
      'Built and integrated agent explanation workflow in real-time anomaly detection dashboard using websockets to deliver instant information to client side.',
      'Collaborated in an agile, fast-paced environment, proactively providing updates, gathering feedback, and adapting to ambiguity through iterative development and communication with stakeholders.'
    ]
  }
];

window.INVOLVEMENT = [
  {
    org: 'Rowdy Creators',
    role: 'Vice President',
    details: 'Ensuring retention rates and engagement in organization increases.'
  },
  {
    org: 'HardWorkingGeniuses YouTube ',
    role: 'Co-host / Streamer',
    details: 'Aimed to help beginners build confidence in their problem-solving by solving Leetcode problems.',
    url: 'https://www.youtube.com/@hardworkinggeniuses'
  }
];

window.EDUCATION = [
  {
    school: 'University of Texas at San Antonio',
    degree: 'B.S. in Computer Science',
    period: '2023 - 2025'
  },
  {
    school: 'University of Texas at San Antonio',
    degree: 'B.A. in Communications, Minor in Marketing',
    period: '2019 - 2023'
  },
  {
    school: 'East Central High School',
    degree: 'Diploma',
    period: '2015 - 2019',
    notes: 'Interests were in video production and computer hardware classes'
  }
];

// Frequently edited personal info — keep here so mobile and desktop stay in sync
window.ABOUT = {
  summary: "Hi - here's a super quick intro on me. From San Antonio, Texas. I enjoy playing basketball, biking, hiking. During free time I work on personal coding projects and I stream on YouTube. My career interests are within backend engineering. More specifically: data pipelines, agentic workflows, and system arcitecture.",
  // ------- These aren't in use, but can be added later if needed ------ //
  skills: ["Python","Go", "C", "SQL", "Docker", "GitHub","Cline/Cursor"],
  location: "San Antonio, TX"
  // ----- //
};

window.CONTACT = {
  email: "you@example.com", // I currently don't want email to be published, but in the future, this can change.
  repo: "https://github.com/carloslopezjr/terminal-portfolio",
  links: [
    {label: 'GitHub', url: 'https://github.com/carloslopezjr'},
    {label: 'LinkedIn', url: 'https://www.linkedin.com/in/carloslopezjr19'}
  ]
};
