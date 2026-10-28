import {
  COURSE,
  GENERATED_CONTENT,
  TOPICS,
  type Course,
  type GeneratedContent,
  type Topic,
} from '@/data/seed-data'

/**
 * One content pack per course the teacher can switch to. The roster is shared;
 * everything the teacher teaches (plan, live lesson, AI output) is per course.
 * The two added courses are written in English, the demo's audience language.
 */
export type CoursePack = {
  course: Course
  /** Accent used for the course chip in the sidebar. */
  accent: string
  /** Week the course is currently on; its topic is the "live" lesson. */
  currentWeek: number
  topics: Topic[]
  generatedContent: GeneratedContent
}

const OB: Course = {
  id: 'ob-01',
  name: 'Organisational Behaviour',
  code: 'MGT2201',
  university: 'Sripatum University',
}

const SM: Course = {
  id: 'sm-01',
  name: 'Strategic Management',
  code: 'MGT4401',
  university: 'Sripatum University',
}

const obTopic = (week: number, title: string, learningObjective: string): Topic => ({
  id: `ob-t${week}`,
  courseId: OB.id,
  week,
  title,
  learningObjective,
})

const smTopic = (week: number, title: string, learningObjective: string): Topic => ({
  id: `sm-t${week}`,
  courseId: SM.id,
  week,
  title,
  learningObjective,
})

export const COURSE_PACKS: CoursePack[] = [
  {
    course: COURSE,
    accent: '#D12E80',
    currentWeek: 2,
    topics: TOPICS,
    generatedContent: GENERATED_CONTENT,
  },

  /* ----------------------------------------------- Organisational Behaviour -- */
  {
    course: OB,
    accent: '#0F9D8F',
    currentWeek: 2,
    topics: [
      obTopic(1, 'Individual Differences & Perception', 'Explain how personality, perception and attitudes shape behaviour at work'),
      obTopic(2, 'Motivation: Maslow vs Herzberg', 'Compare content theories of motivation and use them to design a reward plan for a Thai workplace'),
      obTopic(3, 'Teams & Group Dynamics', "Diagnose a team's development stage with Tuckman's model and recommend the next intervention"),
      obTopic(4, 'Leadership Styles', 'Contrast transformational, transactional and servant leadership using real organisational cases'),
      obTopic(5, 'Conflict & Negotiation', 'Choose a conflict-handling style (Thomas–Kilmann) that fits a given workplace situation'),
      obTopic(6, 'Organisational Culture & Change', "Use Schein's levels of culture and Kotter's 8 steps to plan an organisational change"),
    ],
    generatedContent: {
      activities: [
        {
          name: 'Motivation Fishbowl Debate',
          format: 'debate',
          durationMin: 25,
          steps: [
            'Split the class into Team Maslow and Team Herzberg, mixing faculties in each team',
            'Scenario: a Bangkok start-up gave everyone a 10% pay rise, yet junior staff keep leaving',
            'Each team explains why the pay rise failed using only its theory, in 3-minute rounds',
            'The outer circle votes and names the single strongest piece of evidence',
          ],
          whyItWorks:
            'The pay-rise puzzle exposes the "more money = more motivation" misconception, and mixed faculties bring different ideas of what a reward is',
          materialsNeeded: 'Scenario card and voting cards (ready in the system)',
        },
        {
          name: 'Reward Redesign Case',
          format: 'case-based',
          durationMin: 20,
          steps: [
            'Case: a call centre with 40% yearly staff turnover',
            'Groups of 3-4 sort the current perks into hygiene factors and motivators',
            'Redesign a 3-item reward package within a fixed budget',
            'Each group pitches its package in 2 minutes',
          ],
          whyItWorks: 'Turns theory into a budget decision — accounting students cost it, communication students sell it',
          materialsNeeded: 'Call-centre case sheet and budget template (ready in the system)',
        },
        {
          name: 'Hygiene or Motivator? Speed Sort',
          format: 'quick-game',
          durationMin: 10,
          steps: [
            '12 workplace items flash on screen, one at a time',
            'Students tap Hygiene or Motivator within 20 seconds',
            'A live chart shows how the class split on each item',
            'Top 3 earn bonus XP',
          ],
          whyItWorks: 'A fast warm-up that doubles as a pre-test of the core distinction',
          materialsNeeded: 'ClassLoop quiz (already built)',
        },
      ],
      flashcards: [
        {
          front: "Maslow's Hierarchy of Needs",
          back: 'Five levels of need — physiological, safety, belonging, esteem, self-actualisation — met roughly from the bottom up',
          hint: 'A hungry employee will not care about a job title',
        },
        {
          front: 'Hygiene Factors (Herzberg)',
          back: 'Pay, policy, supervision and conditions: they prevent dissatisfaction but do not create motivation',
          hint: 'Fixing the air-con stops complaints, it does not inspire',
        },
        {
          front: 'Motivators (Herzberg)',
          back: 'Achievement, recognition, responsibility and growth: the factors that build real job satisfaction',
          hint: 'Being trusted with a client often beats a bonus',
        },
        {
          front: 'Expectancy Theory (Vroom)',
          back: 'Motivation = Expectancy × Instrumentality × Valence; if any one is zero, motivation is zero',
          hint: 'Effort → performance → reward → do I value it?',
        },
        {
          front: 'Equity Theory (Adams)',
          back: 'People compare their input-to-reward ratio with others; perceived unfairness reduces effort',
          hint: 'Same work, a colleague paid more → effort drops',
        },
        {
          front: 'Self-Determination Theory',
          back: 'Intrinsic motivation grows when people feel autonomy, competence and relatedness',
          hint: 'Choice, mastery, belonging',
        },
        {
          front: 'Intrinsic vs Extrinsic Motivation',
          back: 'Doing a task for its own sake vs for an external reward; heavy rewards can crowd out intrinsic drive',
          hint: 'Paying people to read can make them read less for fun',
        },
        {
          front: 'Goal-Setting Theory',
          back: 'Specific, challenging goals with feedback lead to higher performance than "do your best"',
          hint: 'SMART goals',
        },
      ],
      pretest: [
        {
          id: 'ob-q1',
          stem: 'According to Herzberg, which of these is a hygiene factor?',
          options: ['Recognition for good work', 'Salary', 'Responsibility', 'Opportunities for growth'],
          answerIndex: 1,
          difficulty: 'easy',
          misconception: 'Pay removes dissatisfaction but rarely creates lasting motivation',
        },
        {
          id: 'ob-q2',
          stem: "In Maslow's hierarchy, which need comes directly after physiological needs?",
          options: ['Safety', 'Esteem', 'Belonging', 'Self-actualisation'],
          answerIndex: 0,
          difficulty: 'easy',
          misconception: 'Students often skip safety and jump straight to belonging',
        },
        {
          id: 'ob-q3',
          stem: 'A team receives a pay rise but motivation stays flat. What would Herzberg say?',
          options: [
            'The rise was too small',
            'Pay is a hygiene factor: it removes dissatisfaction but does not motivate',
            'The staff are already self-actualised',
            'Pay only motivates managers',
          ],
          answerIndex: 1,
          difficulty: 'medium',
          misconception: '"More money = more motivation"',
        },
        {
          id: 'ob-q4',
          stem: 'An employee believes good performance will not be rewarded. Which part of Vroom\'s expectancy theory is low?',
          options: ['Expectancy', 'Instrumentality', 'Valence', 'Equity'],
          answerIndex: 1,
          difficulty: 'medium',
          misconception: 'Confusing expectancy (effort → performance) with instrumentality (performance → reward)',
        },
        {
          id: 'ob-q5',
          stem: 'Which job design best supports intrinsic motivation under Self-Determination Theory?',
          options: [
            'Strict monthly targets with cash bonuses',
            'Autonomy over how work is done, room to grow skills, and a supportive team',
            'A public ranking of every employee',
            'A higher base salary only',
          ],
          answerIndex: 1,
          difficulty: 'hard',
          misconception: 'External rewards can crowd out intrinsic motivation',
        },
      ],
      mixedClassTip:
        'Engineering students tend to see motivation as a system of incentives, while Communication Arts students focus on recognition and meaning. Pair them and have each defend the other side in the debate.',
    },
  },

  /* --------------------------------------------------- Strategic Management -- */
  {
    course: SM,
    accent: '#F2994A',
    currentWeek: 3,
    topics: [
      smTopic(1, 'The Strategic Management Process', 'Explain how vision, mission and objectives connect to strategy formulation and execution'),
      smTopic(2, 'External Analysis: PESTEL', 'Use PESTEL to identify macro-environment trends that affect a Thai industry'),
      smTopic(3, "Porter's Five Forces", "Assess an industry's attractiveness with Porter's Five Forces and back each rating with evidence"),
      smTopic(4, 'Internal Analysis: Resources & VRIO', 'Apply the VRIO framework to judge which resources give a sustained competitive advantage'),
      smTopic(5, 'Generic & Blue Ocean Strategies', 'Compare cost leadership, differentiation and focus with Blue Ocean thinking for a given firm'),
      smTopic(6, 'Strategy Execution & the Balanced Scorecard', 'Translate a strategy into measurable objectives with a Balanced Scorecard'),
    ],
    generatedContent: {
      activities: [
        {
          name: 'Five Forces Face-off',
          format: 'debate',
          durationMin: 25,
          steps: [
            'Five teams, each owning one force, with faculties mixed in every team',
            'Industry: Thai food-delivery apps (Grab, LINE MAN, Robinhood)',
            'Each team argues in 2 minutes why its force is the biggest threat to profits',
            'The class ranks the forces and decides how attractive the industry is',
          ],
          whyItWorks: 'Owning a single force makes students go deep, and ranking the forces forces real trade-offs',
          materialsNeeded: 'Industry fact sheet (ready in the system)',
        },
        {
          name: 'Industry Attractiveness Canvas',
          format: 'case-based',
          durationMin: 20,
          steps: [
            'Case: Thai coffee chains — Café Amazon vs independent roasters',
            'Groups rate each force low / medium / high and attach one piece of evidence',
            'Swap canvases with another group and challenge one rating',
            'Propose one strategic move that weakens the strongest force',
          ],
          whyItWorks: 'A familiar local market makes the evidence easy to find and debate',
          materialsNeeded: 'Five Forces canvas template (ready in the system)',
        },
        {
          name: 'Which Force? Headline Quiz',
          format: 'quick-game',
          durationMin: 10,
          steps: [
            '10 real business headlines, 30 seconds each',
            'Students tag the force each headline changes',
            'Results show instantly; the top 3 earn bonus XP',
          ],
          whyItWorks: 'Links the model to the news and works as a quick pre-test',
          materialsNeeded: 'ClassLoop quiz (already built)',
        },
      ],
      flashcards: [
        {
          front: 'Threat of New Entrants',
          back: 'How easily new competitors can enter the industry and push prices and profits down',
          hint: 'High barriers to entry = low threat',
        },
        {
          front: 'Bargaining Power of Suppliers',
          back: 'How much suppliers can raise prices or cut quality; strong when they are few or unique',
          hint: 'A handful of chip makers vs many phone brands',
        },
        {
          front: 'Bargaining Power of Buyers',
          back: 'How much customers can push prices down; strong when switching is cheap and products are standard',
          hint: 'Big supermarkets vs small snack brands',
        },
        {
          front: 'Threat of Substitutes',
          back: 'Products from outside the industry that meet the same need',
          hint: 'Video calls vs business-class flights',
        },
        {
          front: 'Competitive Rivalry',
          back: 'The intensity of competition among existing firms — price wars, ads, new products',
          hint: 'Many similar rivals + slow growth = fierce rivalry',
        },
        {
          front: 'Barriers to Entry',
          back: 'Economies of scale, brand loyalty, capital needs, regulation and access to distribution',
          hint: 'Why few people start a new airline',
        },
        {
          front: 'Industry Attractiveness',
          back: 'The overall profit potential of an industry once all five forces are weighed together',
          hint: 'Weak forces = attractive industry',
        },
        {
          front: 'Complementors',
          back: 'Firms whose products make yours more valuable — often called the "sixth force"',
          hint: 'App developers make a smartphone platform stronger',
        },
      ],
      pretest: [
        {
          id: 'sm-q1',
          stem: 'Which of these is a barrier to entry?',
          options: ['Low switching costs', 'Economies of scale', 'Many small suppliers', 'Undifferentiated products'],
          answerIndex: 1,
          difficulty: 'easy',
          misconception: 'Mixing up barriers with the factors that make entry easier',
        },
        {
          id: 'sm-q2',
          stem: 'For a coffee chain, bubble-tea shops meeting the same "afternoon drink" need are best described as…',
          options: ['Direct rivals', 'Substitutes', 'Suppliers', 'New entrants'],
          answerIndex: 1,
          difficulty: 'easy',
          misconception: 'Substitutes come from outside the industry; rivals sell the same product',
        },
        {
          id: 'sm-q3',
          stem: 'Buyer power is HIGH when…',
          options: [
            'Buyers are many and small',
            'Products are highly differentiated',
            'Buyers can switch cheaply and the products are standard',
            'Suppliers are concentrated',
          ],
          answerIndex: 2,
          difficulty: 'medium',
          misconception: 'Thinking the number of buyers alone decides their power',
        },
        {
          id: 'sm-q4',
          stem: 'A few large chip makers supply every smartphone brand. Which force does this mainly strengthen?',
          options: ['Buyer power', 'Supplier power', 'Threat of substitutes', 'Competitive rivalry'],
          answerIndex: 1,
          difficulty: 'medium',
          misconception: 'Looking at the phone market and missing the supply side',
        },
        {
          id: 'sm-q5',
          stem: 'What is a Five Forces analysis mainly used for?',
          options: [
            "Evaluating a firm's internal resources",
            'Judging how attractive and profitable an industry is',
            'Setting individual sales targets',
            'Measuring employee motivation',
          ],
          answerIndex: 1,
          difficulty: 'hard',
          misconception: 'Five Forces is an external, industry-level tool — internal resources are VRIO',
        },
      ],
      mixedClassTip:
        'Accounting students quantify margins quickly, while Digital Media students spot substitutes coming from new technology. Put one of each in every force team so the evidence mixes numbers and trends.',
    },
  },
]

export function coursePack(courseId: string): CoursePack {
  return COURSE_PACKS.find((p) => p.course.id === courseId) ?? COURSE_PACKS[0]
}
