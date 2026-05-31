export type LogoPosition = string;

export interface LogoInstance {
  id: string;
  position: LogoPosition;
  src: string;
  scale: number;
  rotation: number;
  isDefault: boolean;
  visible: boolean;
}
