"use client"

import { create } from 'zustand';
import { Cron } from '../types';

export interface CronState {
  crons: Cron[]
}

export interface CronActions {
  setCrons: (crons: Cron[]) => void;
  removeCron: (name: string) => void;
  addCron: (cron: Cron) => void;
}

export const useCronStore = create<CronState & CronActions>((set) => ({
  crons: [],
  setCrons: (crons) => set({ crons }),
  removeCron: (name) => set((state) => ({ crons: state.crons.filter(cron => cron.name !== name) })),
  addCron: (cron) => set((state) => ({ crons: [...state.crons, cron]}))
}))