"use client";

import { create } from "zustand";
import { Device } from "../types";

export interface DeviceState {
  devices: Device[];
}

export interface DeviceActions {
  setDevices: (devices: Device[]) => void;
  removeDevice: (rfAdress: string) => void;
}

export const useDeviceStore = create<DeviceState & DeviceActions>((set) => ({
  devices: [],
  setDevices: (devices) => set({ devices }),
  removeDevice: (rfAddress) =>
    set((state) => ({
      devices: state.devices.filter((device) => device.rfAddress !== rfAddress),
    })),
}));
