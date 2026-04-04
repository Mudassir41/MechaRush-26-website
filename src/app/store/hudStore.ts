import { create } from 'zustand';

export type TelemetryState = 'NOMINAL' | 'CHAOTIC';

interface HUDState {
  telemetry: TelemetryState;
  ignitionDone: boolean;
  ignitionAudioStarted: boolean;
  setTelemetry: (state: TelemetryState) => void;
  setIgnitionDone: (done: boolean) => void;
  setIgnitionAudioStarted: (started: boolean) => void;
}

export const useHUDStore = create<HUDState>((set) => ({
  telemetry: 'NOMINAL',
  ignitionDone: false,
  ignitionAudioStarted: false,
  setTelemetry: (telemetry) => set({ telemetry }),
  setIgnitionDone: (ignitionDone) => set({ ignitionDone }),
  setIgnitionAudioStarted: (started) => set({ ignitionAudioStarted: started }),
}));
