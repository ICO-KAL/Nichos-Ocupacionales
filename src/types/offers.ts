export interface Location {
  lat: number;
  lng: number;
}

export interface Payment {
  amount: number;
  currency: string;
  period: string; // ej: "hora", "mes"
}

export interface Question {
  id: string;
  label: string;
  type: "text" | "select" | "date" | "check"; 
  required: boolean;
  options?: string[]; // Solo presente si el tipo es "select" o "check"
}

export interface Offer {
  id: string;
  jobTypeKey: string;
  jobTypeName: string;
  contractType: string;
  description: string;
  address: string;
  location: Location;
  payment: Payment;
  photo: string;
  deadline: string;
  customAnswers: Record<string, string>;
  questions: Question[];
  status: string;
  applicantsCount: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  isIdentityRevealed: boolean;
  likedByMe: boolean;
}

export interface OffersResponse {
  ok: boolean;
  data: Offer[];
}

export interface CustomField {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "check";
  required: boolean;
  options?: string[];
}

export interface JobType {
  id: string;
  key: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  customFields: CustomField[];
}

export interface Application {
  id: string;
  offerId: string;
  applicantId: string;
  comment: string;
  answers: Record<string, any>;
  rating: number | null;
  status: 'applied' | 'rejected' | 'finalist' | 'winner' | string;
  createdAt: string;
  updatedAt: string;
  offer: Offer;

}