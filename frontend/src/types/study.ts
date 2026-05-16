export interface StudyItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface StudyLink {
  id: string;
  label: string;
  url: string;
}

export interface StudyTopic {
  id: string;
  title: string;
  items: StudyItem[];
  links: StudyLink[];
  createdAt: string;
  updatedAt: string;
}
