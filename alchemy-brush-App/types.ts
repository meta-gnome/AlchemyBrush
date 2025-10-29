
export interface BrushSettings {
  color: string;
  size: number;
  opacity: number;
}

export interface Shape {
  id: string;
  svg: string;
}

export interface ShapeGroup {
  name: string;
  shapes: Shape[];
}

export interface ActiveShapeGroups {
  [groupName: string]: boolean;
}
