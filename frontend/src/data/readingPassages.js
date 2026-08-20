export const passages = [
  {
    id: "passage-1",
    title: "The History of the Internet",
    text: `The internet, as we know it today, is a global network of interconnected computers that has revolutionized the way we communicate, work, and access information. However, its origins are much more humble. The concept of a computer network dates back to the 1960s when the United States Department of Defense funded a project called ARPANET (Advanced Research Projects Agency Network). The primary goal of ARPANET was to create a resilient communication system that could survive a nuclear attack. It allowed multiple computers to communicate on a single network.

The first successful message sent over ARPANET was in 1969, from a computer at the University of California, Los Angeles (UCLA) to one at the Stanford Research Institute. The message was meant to be "LOGIN," but the system crashed after only the first two letters ("LO") were sent. Despite this initial hiccup, the network continued to grow, connecting more universities and research institutions throughout the 1970s.

A major breakthrough occurred in 1983 with the adoption of TCP/IP (Transmission Control Protocol/Internet Protocol). This standardized protocol allowed different networks to communicate with each other, effectively creating the "network of networks" that we now call the internet. In 1989, British computer scientist Tim Berners-Lee invented the World Wide Web, a system of interlinked hypertext documents accessed via the internet. This made the internet more accessible and user-friendly, paving the way for its explosive growth in the 1990s and beyond.

Today, the internet is an integral part of modern society. It is estimated that over half of the global population has internet access. While it has brought numerous benefits, such as instant communication and access to vast amounts of knowledge, it has also introduced new challenges, including cybersecurity threats, digital divides, and concerns about data privacy.`,
    sections: [
      {
        id: "sec-1",
        title: "Questions 1-3",
        instructions: "Do the following statements agree with the information given in Reading Passage 1?\nIn boxes 1-3 on your answer sheet, select TRUE, FALSE, or NOT GIVEN.",
        type: "true-false-ng",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        questions: [
          {
            id: "q1",
            question: "The ARPANET was originally created to share academic research across universities.",
            answer: "FALSE"
          },
          {
            id: "q2",
            question: "The first message sent over ARPANET was fully transmitted without errors.",
            answer: "FALSE"
          },
          {
            id: "q3",
            question: "Over 75% of the global population currently has internet access.",
            answer: "NOT GIVEN"
          }
        ]
      },
      {
        id: "sec-2",
        title: "Questions 4-5",
        instructions: "Choose the correct letter, A, B, C or D.",
        type: "multiple-choice",
        questions: [
          {
            id: "q4",
            question: "What was the significance of TCP/IP in 1983?",
            options: [
              "A. It made the internet free to use.",
              "B. It allowed different computer networks to communicate.",
              "C. It introduced the World Wide Web.",
              "D. It prevented the system from crashing during messages."
            ],
            answer: "B. It allowed different computer networks to communicate."
          },
          {
            id: "q5",
            question: "Who is credited with inventing the World Wide Web?",
            options: [
              "A. The US Department of Defense",
              "B. Stanford Research Institute",
              "C. UCLA",
              "D. Tim Berners-Lee"
            ],
            answer: "D. Tim Berners-Lee"
          }
        ]
      }
    ]
  },
  {
    id: "passage-2",
    title: "The Intelligence of Crows",
    text: `A. Crows and their relatives in the corvid family, including ravens, jays, and magpies, have long been recognized for their remarkable intelligence. While often associated with myth and folklore, scientific research over the past few decades has revealed that these birds possess cognitive abilities that rival those of some primates. 

B. One of the most well-documented examples of corvid intelligence is their ability to use and manufacture tools. New Caledonian crows, in particular, have been observed crafting hooks from twigs and leaves to extract insects from tree crevices. In laboratory settings, these crows have even demonstrated the ability to solve complex puzzles involving multiple steps to obtain a food reward, showing an understanding of cause and effect.

C. Furthermore, crows exhibit impressive memory and social intelligence. Researchers in Seattle found that crows can recognize individual human faces. They famously wore caveman masks while capturing and banding crows. For years afterward, crows on the university campus would specifically scold and dive-bomb anyone wearing the caveman mask, while ignoring those in different masks or no mask at all. This indicates not only facial recognition but also the ability to communicate perceived threats to other members of their flock.

D. Despite their small brain size relative to mammals, crows have a high neuron density, particularly in the nidopallium, an area of the bird brain associated with executive functions like decision-making and planning. This biological adaptation suggests that brain structure, rather than just size, plays a crucial role in cognitive capabilities.`,
    sections: [
      {
        id: "sec-3",
        title: "Questions 1-4",
        instructions: "Reading Passage 2 has four paragraphs, A-D.\nChoose the most suitable paragraph headings from the list of headings and write the correct letter, A-D, in boxes 1-4.",
        type: "matching-headings",
        options: ["A", "B", "C", "D"],
        questions: [
          {
            id: "q6",
            question: "An experiment involving facial recognition",
            answer: "C"
          },
          {
            id: "q7",
            question: "The role of brain density in intelligence",
            answer: "D"
          },
          {
            id: "q8",
            question: "Crafting objects to acquire food",
            answer: "B"
          },
          {
            id: "q9",
            question: "A comparison to primate intelligence",
            answer: "A"
          }
        ]
      },
      {
        id: "sec-4",
        title: "Questions 5-6",
        instructions: "Complete the sentences below.\nChoose NO MORE THAN TWO WORDS from the passage for each answer.",
        type: "fill-in-blank",
        questions: [
          {
            id: "q10",
            question: "New Caledonian crows are known for making __________ out of twigs to get food.",
            answer: "hooks"
          },
          {
            id: "q11",
            question: "Crows have a high density of neurons in the __________, which handles decision-making.",
            answer: "nidopallium"
          }
        ]
      }
    ]
  }
];
