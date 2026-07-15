export interface Answer {
  id: string;
  selector: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'not assigned';
  text: string;
  resultCount: number;
}
