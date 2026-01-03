
export enum TreeState {
  CLOSED = 'CLOSED',
  SCATTERED = 'SCATTERED',
  PHOTO_ZOOM = 'PHOTO_ZOOM'
}

export interface HandData {
  isFist: boolean;
  isOpen: boolean;
  isPinching: boolean;
  rotation: number;
  position: { x: number; y: number; z: number };
  rawLandmarks: any;
}

export interface PhotoItem {
  id: string;
  url: string;
}
