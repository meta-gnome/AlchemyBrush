
import type { ShapeGroup } from './types';

const GEOMETRIC_SHAPES: string[] = [
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,0 100,100 0,100" fill="currentColor"/></svg>`,
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="currentColor"/></svg>`,
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="0,0 100,50 0,100" fill="currentColor"/></svg>`,
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,0 100,50 50,100 0,50" fill="currentColor"/></svg>`,
];

const ORGANIC_SHAPES: string[] = [
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" fill="currentColor"/></svg>`,
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="50" rx="50" ry="25" fill="currentColor"/></svg>`,
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M48.9,-58.3C61.3,-46.7,67.9,-29.4,69.5,-12.3C71.1,4.7,67.7,21.5,58.7,35.5C49.7,49.5,35.1,60.7,18.9,67.1C2.7,73.5,-15.1,75,-30.3,69.1C-45.6,63.2,-58.3,49.9,-66,34.7C-73.7,19.5,-76.4,2.4,-71.9,-12.9C-67.4,-28.2,-55.7,-41.7,-42.6,-52.4C-29.5,-63.1,-14.7,-71,1.8,-73.2C18.3,-75.4,36.5,-70,48.9,-58.3Z" transform="translate(100 100)" /></svg>`,
];

const LINE_SHAPES: string[] = [
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" stroke-width="5"/></svg>`,
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M 10,90 Q 50,10 90,90" stroke="currentColor" stroke-width="5" fill="none"/></svg>`,
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M10 10 H 90 V 90 H 10 L 10 10" stroke="currentColor" stroke-width="5" fill="none"/></svg>`,
];


const v4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


export const DEFAULT_SHAPES: ShapeGroup[] = [
  {
    name: 'Geometric',
    shapes: GEOMETRIC_SHAPES.map(svg => ({ id: v4(), svg })),
  },
  {
    name: 'Organic',
    shapes: ORGANIC_SHAPES.map(svg => ({ id: v4(), svg })),
  },
  {
    name: 'Lines',
    shapes: LINE_SHAPES.map(svg => ({ id: v4(), svg })),
  }
];
