export interface ImageAnalysisFlags {
  ai_generation_analysis: {
    likelihood: 'High' | 'Medium' | 'Low' | 'Unlikely';
    evidence: string[];
    confidence_score: number;
  };
  is_photo: boolean;
  is_animation: boolean;
  has_human_face: boolean;
  is_full_face_visible: boolean;
  is_famous_person: boolean;
  has_known_brand_or_character: boolean;
  title: string;
  description: string;
}

export type GroupNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

export interface GroupClassification {
  group: GroupNumber;
  type: string;
  classification: string;
}

export enum RegistrationStatus {
  CAN_REGISTER = 'CAN_REGISTER',
  CANNOT_REGISTER = 'CANNOT_REGISTER',
  REQUIRES_REVIEW = 'REQUIRES_REVIEW',
}

export interface LicenseSettings {
  status: RegistrationStatus;
  title: string;
  description: string;
  buttonText: string;
  color: 'green' | 'red' | 'yellow';
}

export interface ClassificationResult {
  flags: ImageAnalysisFlags;
  classification: GroupClassification;
  license: LicenseSettings;
}
