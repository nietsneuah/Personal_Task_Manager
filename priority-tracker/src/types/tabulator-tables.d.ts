declare module 'tabulator-tables' {
  export interface TabulatorOptions {
    data?: unknown[];
    layout?: string;
    responsiveLayout?: string;
    pagination?: string;
    paginationSize?: number;
    height?: string | number;
    columns?: TabulatorColumn[];
    [key: string]: unknown;
  }

  export interface TabulatorColumn {
    title?: string;
    field?: string;
    sorter?: string;
    width?: number;
    responsive?: number;
    hozAlign?: string;
    formatter?: (cell: CellComponent) => string | HTMLElement;
    cellClick?: (e: MouseEvent, cell: CellComponent) => void;
    [key: string]: unknown;
  }
  
  export class TabulatorFull {
    constructor(element: HTMLElement, options: TabulatorOptions);
    destroy(): void;
    redraw(force?: boolean): void;
  }
  
  export interface CellComponent {
    getValue(): string | number | boolean | null | undefined;
    getRow(): RowComponent;
  }
  
  export interface RowComponent {
    getData(): Record<string, unknown>;
    delete(): void;
  }
}