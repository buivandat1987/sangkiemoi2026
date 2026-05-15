
export interface ReportData {
  day: string;
  month: string;
  year: string;
  title: string;
  author: string;
  unit: string;
  collaborators: string;
  startDate: string;
  endDate: string;
  problemStatement: {
    initiativeName: string;
    necessity: string;
  };
  content: {
    status: {
      advantages: string;
      disadvantages: string;
    };
    causes: string;
    solutions: string;
  };
  evaluation: {
    novelty: string;
    efficiency: string;
    scope: string;
  };
  conclusion: string;
}

export type ActiveSection = 'info' | 'problem' | 'content' | 'evaluation' | 'conclusion';
