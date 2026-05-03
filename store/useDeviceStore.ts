import { create } from 'zustand';

export interface Device {
  deviceId: string;
  name: string;
  type: string;
  status: 'connected' | 'syncing' | 'error' | 'disconnected';
  latency?: number;
  connectedAt?: string;
}

interface DeviceState {
  devices: Device[];
  addDevice: (d: Device) => void;
  removeDevice: (id: string) => void;
  updateLatency: (id: string, latency: number) => void;
  updateStatus: (id: string, status: Device['status']) => void;
  clearDevices: () => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: [],
  addDevice: (d) => set((s) => ({
    devices: s.devices.some((e) => e.deviceId === d.deviceId)
      ? s.devices.map((e) => (e.deviceId === d.deviceId ? d : e))
      : [...s.devices, d],
  })),
  removeDevice: (id) => set((s) => ({ devices: s.devices.filter((d) => d.deviceId !== id) })),
  updateLatency: (id, latency) => set((s) => ({
    devices: s.devices.map((d) => (d.deviceId === id ? { ...d, latency } : d)),
  })),
  updateStatus: (id, status) => set((s) => ({
    devices: s.devices.map((d) => (d.deviceId === id ? { ...d, status } : d)),
  })),
  clearDevices: () => set({ devices: [] }),
}));
