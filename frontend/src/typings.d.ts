// Temporary shim for chart.js typings to satisfy ng2-charts until a proper typing solution is applied.
// Keep as minimal 'any' to unblock compilation; replace with precise types later.

declare module 'chart.js' {
  export const Chart: any;
  export const registerables: any;
  export type ChartEvent = any;
  export type ChartType = any;
  export type DefaultDataPoint<T = any> = any;
  export type Plugin = any;
  export type ChartComponentLike = any;
  export type Defaults = any;
  export type ChartConfiguration<T = any, D = any, L = any> = any;
  export type ChartOptions = any;
  export type ChartData = any;
  export type ChartDataset = any;
  export default Chart;
}
