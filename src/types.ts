export type ColIdx = number & { readonly neverUsed?: unique symbol };
export type RowIdx = number & { readonly neverUsed?: unique symbol };
export type Coordinate = [ColIdx, RowIdx];
