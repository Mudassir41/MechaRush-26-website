import { create } from 'zustand';

export type TelemetryState = 'NOMINAL' | 'CHAOTIC';

interface HUDState {
  telemetry: TelemetryState;
  ignitionDone: boolean;
  setTelemetry: (state: TelemetryState) => void;
  setIgnitionDone: (done: boolean) => void;
}

export const useHUDStore = create<HUDState>((set) => ({
  telemetry: 'NOMINAL',
  ignitionDone: false,
  setTelemetry: (telemetry) => set({ telemetry }),
  setIgnitionDone: (ignitionDone) => set({ ignitionDone }),
}));
