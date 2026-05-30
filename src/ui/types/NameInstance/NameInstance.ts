export type NamePosition = 'top' | 'bottom';

export interface NameInstance {
  id: string;
  position: NamePosition;
  text: string;
  font: string;
  fontSize: number;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
}
