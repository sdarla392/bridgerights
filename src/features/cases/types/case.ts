export type Unknown = 'unknown';

export type Reason =
  | 'sold'
  | 'redevelopment'
  | 'withdraw'
  | 'notice'
  | 'relocation'
  | 'rent'
  | 'unsure';

export interface Facts {
  city: string;
  propertyType: string;
  units: string;
  builtEra: string;
  reason: Reason | '';
  hasNotice: string;
  noticeDate: string;
  tenancyType: string;
  tenancyLength: string;
  relocationOffered: string;
  court: string;
}

export type Applicability =
  | 'potentially_applicable'
  | 'conditionally_applicable'
  | 'not_enough_information'
  | 'professional_review_required'
  | 'not_applicable';

export interface Source {
  id: string;
  title: string;
  type: string;
  jurisdiction: string;
  url: string;
}

export interface Condition {
  key: keyof Facts;
  label: string;
  test: (value: string) => boolean;
}

export interface Rule {
  id: string;
  jurisdictions: string[];
  topic: string;
  title: string;
  summary: string;
  conditions: Condition[];
  exceptions: string[];
  followUp: string;
  sourceIds: string[];
}

export interface Finding {
  ruleId: string;
  title: string;
  topic: string;
  summary: string;
  applicability: Applicability;
  matched: string[];
  unresolved: string[];
  exceptions: string[];
  followUp: string;
  sourceIds: string[];
}

export type TaskKind = 'review' | 'gather' | 'verify' | 'contact' | 'follow_up';

export interface Task {
  id: string;
  kind: TaskKind;
  title: string;
  detail: string;
  done: boolean;
}

export interface NoticeFields {
  noticeType: string;
  noticeDate: string;
  moveOutDate: string;
  statedReason: string;
  relocationStated: string;
}

export type CheckState = 'present' | 'absent' | 'unclear' | 'not_applicable';

export interface NoticeCheck {
  id: string;
  label: string;
  requirement: string;
  compared: string;
  state: CheckState;
  askProfessional: string;
  sourceId: string;
}

export interface DeadlineResult {
  date: string | null;
  label: string;
  trace: string;
  sourceId: string;
}

export interface CaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  facts: Facts;
  notice: NoticeFields | null;
  tasks: Task[];
}

export interface CasesState {
  cases: CaseRecord[];
  createCase: (facts: Facts) => string;
  updateFacts: (id: string, facts: Facts) => void;
  saveNotice: (id: string, notice: NoticeFields) => void;
  toggleTask: (id: string, taskId: string) => void;
  deleteCase: (id: string) => void;
}
