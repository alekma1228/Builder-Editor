export interface AllBlockStyles {
  gridTemplateRows: string;
  gridTemplateColumns: string;
  gridArea: string;
  gridRow: string;
  gridColumn: string;
  position: string;
  display: 'block' | 'none';
  width: number;
  maxWidth: string;
  minWidth: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: string;
  background: string;
  backgroundImage: string;
  backgroundSize?: string | number;
  backgroundPosition?: 'initial' | 'inherit' | 'center' | 'left';
  backgroundRepeat?: 'no-repeat';
  border?: string;
  borderTop?: string;
  borderBottom?: string;
  padding?: string | number;
  margin?: string | number;
  backgroundColor?: string;
  zIndex?: number;
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  flexWrap?: 'wrap' | 'nowrap';
  justifyContent?: 'center' | 'start' | 'end' | 'flex-start' | 'flex-end';
  alignItems?: 'center' | 'start' | 'end' | 'self-start' | 'self-end' | 'flex-start' | 'flex-end';
  overflow?: 'visible' | 'hidden' | 'clip' | 'scroll' | 'auto';
}

export type BlockStyles = Partial<AllBlockStyles>;
