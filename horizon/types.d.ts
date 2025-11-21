import { ReactThreeFiber } from '@react-three/fiber';

// 1. Global JSX (for older setups)
declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: any;
      meshLineMaterial: any;
    }
  }
}

// 2. React JSX (for React 18+ / Next.js 13+)
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: any;
      meshLineMaterial: any;
    }
  }
}