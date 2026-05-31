export type NumberPosition = 'front_left' | 'front_right' | 'back';

export interface NumberInstance {
  id: string;
  position: NumberPosition;
  text: string;
  font: string;
  fontSize: number;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
}
