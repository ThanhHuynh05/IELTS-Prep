export const listeningTests = [
  {
    id: "listening-1",
    title: "University Library Registration",
    transcript: "Good morning. Welcome to the university library. How can I help you today? Oh, you'd like to register for a library card? No problem, I just need to take some details from you. First, can I have your full name? It's Peter Thompson. That's T-H-O-M-P-S-O-N. Great. And your student ID number? It's 8 4 9 3 0 2. Let me repeat that, 8 4 9 3 0 2. Okay. What is your current address? I live at 42 Willow Court, on High Street. No, sorry, it's Willow Court, on Station Road. And your phone number? 0 7 7 4 5 2 9 8 1 1. Thank you. The library is open from 8 AM to 10 PM on weekdays, but on weekends we close earlier at 6 PM. As a first-year student, you are allowed to borrow up to 8 books at a time. The late fee for overdue books is 50 pence per day.",
    sections: [
      {
        id: "sec-1",
        title: "Questions 1-4",
        instructions: "Complete the form below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
        type: "fill-in-blank",
        questions: [
          {
            id: "q1",
            question: "Student's last name:",
            answer: "Thompson"
          },
          {
            id: "q2",
            question: "Student ID number:",
            answer: "849302"
          },
          {
            id: "q3",
            question: "Address: 42 Willow Court, __________",
            answer: "Station Road"
          },
          {
            id: "q4",
            question: "Maximum number of books allowed:",
            answer: "8"
          }
        ]
      },
      {
        id: "sec-2",
        title: "Questions 5-6",
        instructions: "Choose the correct letter, A, B, or C.",
        type: "multiple-choice",
        questions: [
          {
            id: "q5",
            question: "What time does the library close on weekends?",
            options: ["A. 8 PM", "B. 10 PM", "C. 6 PM"],
            answer: "C. 6 PM"
          },
          {
            id: "q6",
            question: "How much is the late fee?",
            options: ["A. 15 pence per day", "B. 50 pence per day", "C. 50 pence per week"],
            answer: "B. 50 pence per day"
          }
        ]
      }
    ]
  },
  {
    id: "listening-2",
    title: "Museum Tour Guide",
    transcript: "Welcome everyone to the City Museum of Natural History. My name is Sarah and I will be your guide today. Before we begin, let me give you a brief overview of the layout. We are currently standing in the Main Hall. To your right is the Dinosaur Exhibit, which features a life-size T-Rex skeleton. To your left is the Marine Biology section, where you can see our famous giant squid display. Straight ahead, past the central staircase, is the Geological timeline, showing rock formations from different eras. Please remember that photography is strictly prohibited in the Marine Biology section due to the sensitive nature of the deep-sea specimens, but you may take photos everywhere else. The tour will last approximately 45 minutes, after which you are free to explore the gift shop or visit the cafe on the second floor.",
    sections: [
      {
        id: "sec-3",
        title: "Questions 1-3",
        instructions: "Choose the correct letter, A, B, or C.",
        type: "multiple-choice",
        questions: [
          {
            id: "q7",
            question: "Who is speaking?",
            options: ["A. A museum curator", "B. A tour guide", "C. A security guard"],
            answer: "B. A tour guide"
          },
          {
            id: "q8",
            question: "What is located to the right of the Main Hall?",
            options: ["A. Marine Biology section", "B. Geological timeline", "C. Dinosaur Exhibit"],
            answer: "C. Dinosaur Exhibit"
          },
          {
            id: "q9",
            question: "Where is photography not allowed?",
            options: ["A. In the Dinosaur Exhibit", "B. In the Marine Biology section", "C. In the gift shop"],
            answer: "B. In the Marine Biology section"
          }
        ]
      },
      {
        id: "sec-4",
        title: "Questions 4-5",
        instructions: "Complete the sentences below.\nWrite NO MORE THAN ONE WORD AND/OR A NUMBER for each answer.",
        type: "fill-in-blank",
        questions: [
          {
            id: "q10",
            question: "The guided tour will take __________ minutes.",
            answer: "45"
          },
          {
            id: "q11",
            question: "The museum cafe is located on the __________ floor.",
            answer: "second"
          }
        ]
      }
    ]
  }
];
