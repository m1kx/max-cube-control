export interface BaseResponse {
  success: boolean;
  error?: string;
}

/**
 * Crons
 */

export interface Cron {
  cron: string;
  rfAdresses: string[];
  temperature: number;
  name: string;
  oneTime: boolean;
  enabled: boolean;
}

export interface CronsResponse extends BaseResponse {
  crons: Cron[];
}

/**
 * Devices
 */

export interface Device {
  rfAddress: string;
  targetTemperature: number;
  measuredTemperature: number;
  valvePosition: number;
  name: string;
}

export interface DevicesResponse extends BaseResponse {
  devices: Device[];
}

/**
 * Actions
 */

export interface SetTemperatureBody {
  rfAddress: string;
  targetTemperature: number;
}

export interface ConnectBody {
  name: string;
}

export interface DisconnectBody {
  rfAddress: string;
}
export interface NewCronBody {
  name: string;
  cron: string;
  temperature: number;
  rfAdresses: string[];
  oneTime: boolean;
  enabled: boolean;
}
