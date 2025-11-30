export interface Source {
  id: string;
  name: string;
  url: string;
  category: string;
  description: string;
}

export interface GeneratorConfig {
  includeSelectors: boolean;
  agentFocus: 'general' | 'technical' | 'business' | 'research';
}
