export interface Clue {
  question: string
  answer: string
  value: number
  isDailyDouble?: boolean
  isImage?: boolean
  imagePath?: string
}

export interface Category {
  name: string
  clues: Clue[]
}

export function getTodaysGame(): Category[] {
  return [
    {
      name: "Hometowns",
      clues: [
        {
          question: "This city at the base of the blue ridge mountains on the james river is home to Hunter",
          answer: "What is Lynchburg?",
          value: 200
        },
        {
          question: "You've heard of the twin cities of st. paul, minneanoplis or like dallas and fort worth, but have you heard of this \"higher number\" city which includes Davenport, Iowa",
          answer: "What is Quad Cities?",
          value: 400
        },
        {
          question: "If you wanted a cheeky pint with Katelyn, you might head to this city where the canals were quite literally built for beer.",
          answer: "What is Dublin?",
          value: 600
        },
        {
          question: "Go Blue, Go Julia",
          answer: "What is Ann Arbor?",
          value: 800,
          isDailyDouble: true
        },
        {
          question: "The city of panthers, of the bank named after this country, oh and also Jeremy Powers",
          answer: "What is Charlotte?",
          value: 1000
        }
      ]
    },
    {
      name: "Rebus Raccoon",
      clues: [
        {
          question: "",
          answer: "What is label?",
          value: 200,
          isImage: true,
          imagePath: "/image1.png"
        },
        {
          question: "",
          answer: "What is detection?",
          value: 400,
          isImage: true,
          imagePath: "/image2.png"
        },
        {
          question: "",
          answer: "What is bounding box?",
          value: 600,
          isImage: true,
          imagePath: "/image3.png"
        },
        {
          question: "",
          answer: "What is workspace?",
          value: 800,
          isImage: true,
          imagePath: "/image4.png"
        },
        {
          question: "",
          answer: "What is manufacturing?",
          value: 1000,
          isImage: true,
          imagePath: "/image5.png"
        }
      ]
    },
    {
      name: "Use Cases",
      clues: [
        {
          question: "The largest one ever was Hallmark/westland's 2008 one which saw 150M tons of beef going poof",
          answer: "What is Recall?",
          value: 200
        },
        {
          question: "This car manufacturer saved capital B billions by using roboflow",
          answer: "What is Rivian?",
          value: 400
        },
        {
          question: "Intelisee is a threat detection software that was suffering from a high number of false positives for detecting falls, slips, shooters meaning low precision, but actually would mean high this important metric",
          answer: "What is Recall?",
          value: 600,
          isDailyDouble: true
        },
        {
          question: "This chocolate company was having wrapper issues :(",
          answer: "What is Lindt?",
          value: 800
        },
        {
          question: "Vanilla on Strawberry, Mixed Berry on Strawberry at this company caused allergy concerns and recalls but dont worry we fixed it",
          answer: "What is Chobani?",
          value: 1000
        }
      ]
    }
  ]
}

export const FINAL_JEOPARDY = {
  category: "Computers",
  clue: "During the 1970s, this company based in Armonk NY was famous for it's large large computers called mainframes",
  answer: "What is IBM?"
}
