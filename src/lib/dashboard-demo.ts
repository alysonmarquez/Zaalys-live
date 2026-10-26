// Números de exemplo do dashboard do Painel (os mesmos do original), por período.
// O Estúdio de LIVE usa os mesmos números para montar as transmissões de exemplo.
import type { PeriodKey } from "@/lib/demo-config";

export type DashboardSeries = {
  gmvCents: number;
  commissionCents: number;
  orders: number;
  ticketCents: number;
  items: number;
  views: number;
  clicks: number;
  commissionBaseCents: number;
  series: { label: string; gmvCents: number; orders: number }[];
};

export const SERIES_BY_PERIOD: Record<PeriodKey, DashboardSeries> = {
  today: {
    gmvCents: 184290,
    commissionCents: 36858,
    orders: 21,
    ticketCents: 8775,
    items: 24,
    views: 18400,
    clicks: 940,
    commissionBaseCents: 179100,
    series: [
      { label: "00h", gmvCents: 8990, orders: 1 },
      { label: "04h", gmvCents: 14990, orders: 2 },
      { label: "08h", gmvCents: 26970, orders: 3 },
      { label: "12h", gmvCents: 41950, orders: 5 },
      { label: "16h", gmvCents: 52430, orders: 6 },
      { label: "20h", gmvCents: 38960, orders: 4 },
    ],
  },
  week: {
    gmvCents: 894500,
    commissionCents: 178900,
    orders: 98,
    ticketCents: 9127,
    items: 112,
    views: 92400,
    clicks: 4810,
    commissionBaseCents: 868000,
    series: [
      { label: "Seg", gmvCents: 112000, orders: 12 },
      { label: "Ter", gmvCents: 138400, orders: 15 },
      { label: "Qua", gmvCents: 98900, orders: 11 },
      { label: "Qui", gmvCents: 164200, orders: 18 },
      { label: "Sex", gmvCents: 192000, orders: 21 },
      { label: "Sáb", gmvCents: 189000, orders: 21 },
    ],
  },
  d7: {
    gmvCents: 1042800,
    commissionCents: 208560,
    orders: 114,
    ticketCents: 9147,
    items: 129,
    views: 114200,
    clicks: 5690,
    commissionBaseCents: 1012000,
    series: [
      { label: "D-6", gmvCents: 118000, orders: 13 },
      { label: "D-5", gmvCents: 142000, orders: 15 },
      { label: "D-4", gmvCents: 129800, orders: 14 },
      { label: "D-3", gmvCents: 158000, orders: 17 },
      { label: "D-2", gmvCents: 144000, orders: 16 },
      { label: "Ontem", gmvCents: 166710, orders: 18 },
      { label: "Hoje", gmvCents: 184290, orders: 21 },
    ],
  },
  d15: {
    gmvCents: 2189400,
    commissionCents: 437880,
    orders: 238,
    ticketCents: 9199,
    items: 271,
    views: 248000,
    clicks: 12300,
    commissionBaseCents: 2120000,
    series: [
      { label: "08/10", gmvCents: 280000, orders: 31 },
      { label: "11/10", gmvCents: 345000, orders: 38 },
      { label: "14/10", gmvCents: 392000, orders: 42 },
      { label: "17/10", gmvCents: 368000, orders: 40 },
      { label: "20/10", gmvCents: 412000, orders: 45 },
      { label: "Hoje", gmvCents: 392400, orders: 42 },
    ],
  },
  month: {
    gmvCents: 3482000,
    commissionCents: 696400,
    orders: 382,
    ticketCents: 9115,
    items: 431,
    views: 412000,
    clicks: 19840,
    commissionBaseCents: 3390000,
    series: [
      { label: "Sem 1", gmvCents: 740000, orders: 81 },
      { label: "Sem 2", gmvCents: 862000, orders: 95 },
      { label: "Sem 3", gmvCents: 985500, orders: 108 },
      { label: "Sem 4", gmvCents: 894500, orders: 98 },
    ],
  },
  d30: {
    gmvCents: 4128900,
    commissionCents: 825780,
    orders: 451,
    ticketCents: 9155,
    items: 509,
    views: 498000,
    clicks: 24100,
    commissionBaseCents: 4010000,
    series: [
      { label: "S1", gmvCents: 610000, orders: 66 },
      { label: "S2", gmvCents: 720000, orders: 79 },
      { label: "S3", gmvCents: 845000, orders: 92 },
      { label: "S4", gmvCents: 911100, orders: 100 },
      { label: "S5", gmvCents: 1042800, orders: 114 },
    ],
  },
};
