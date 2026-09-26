export const TAG_MODEL = 'tag';

export interface Tag {
  id: number;
  name: string;
  display_name: string | null;
  type?: string;
  model_type: 'tag';
  created_at?: string;
  updated_at?: string;
  tracks_count?: number;
  albums_count?: number;
}
