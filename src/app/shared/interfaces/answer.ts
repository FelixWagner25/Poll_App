export interface Answer {
  id: string;
  selector: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | '';
  text: string;
  resultCount: number;
}
