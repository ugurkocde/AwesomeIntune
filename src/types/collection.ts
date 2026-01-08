export interface Collection {
  id: string;
  title: string;
  description: string;
  slug: string;
  tools: string[];
  dateCreated: string;
  dateUpdated?: string;
}
