export type LeadInput = {
  firstName: string;
  lastName: string;
  company: string;
  role: string;
  email: string;
  phone?: string;
  companySize?: string;
  budget?: string;
  useCase?: string;
  notes?: string;
};

export type QualificationResult = {
  score: number;
  tier: "hot" | "warm" | "cold";
  summary: string;
  strengths: string[];
  concerns: string[];
  recommendedAction: string;
};
