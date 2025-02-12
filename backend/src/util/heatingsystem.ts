import {
  decode,
  encode,
} from "https://deno.land/std@0.196.0/encoding/base64.ts";

import net from "node:net";

export type Mode = "auto" | "manual" | "vacation" | "boost";

export interface Device {
  rfAddress: string;
  targetTemperature?: number;
  measuredTemperature?: number;
  valvePosition?: number;
}

export interface CubeInfo {
  serialNumber: string;
  rfAddress: string;
  firmwareVersion: string;
  dutyCycle: string;
  freeMemorySlots: string;
}

class TcpClient {
  private conn: net.Socket | null = null;
  private connected = false;
  private host: string;
  private port: number;
  private reconnectInterval: number = 1000;
  private lock = false;
  private commandQueue: Map<string, (data: string) => void> = new Map();

  constructor(host: string, port: number, reconnectInterval: number = 1000) {
    this.host = host;
    this.port = port;
    this.reconnectInterval = reconnectInterval;
  }

  private async acquireLock(): Promise<void> {
    while (this.lock) {
      await new Promise((resolve) => setTimeout(resolve, 10)); // Wait briefly before checking again
    }
    this.lock = true;
  }

  private releaseLock(): void {
    this.lock = false;
  }

  connect() {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();

      this.commandQueue.set("L:", resolve);

      client.connect(this.port, this.host, () => {
        this.connected = true;
        console.log("Connected to cube");
      });

      client.on("data", (data) => {
        const stringData = data.toString();
        for (const [command, resolveCommand] of this.commandQueue) {
          if (
            stringData.split(":")[0].includes(
              command.split(":")[0].toUpperCase(),
            )
          ) {
            resolveCommand(stringData);
            this.commandQueue.delete(command);
          }
        }
      });

      client.on("error", (err) => {
        reject(err);
      });

      client.on("close", () => {
        this.connected = false;
        const interval = setInterval(() => {
          if (this.connected) {
            clearInterval(interval);
            return;
          }
          this.connect();
        }, this.reconnectInterval);
      });

      this.conn = client;
    });
  }

  sendMessageWithResponse(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.conn) {
        reject(new Error("Not connected"));
        return;
      }

      console.log("Sending", command);
      this.commandQueue.set(command, resolve);

      this.conn.write(`${command}\r\n`, (err) => {
        if (err) {
          reject(err);
        }
      });

      this.conn.once("error", (err) => {
        reject(err);
      });

      setTimeout(() => {
        reject(new Error("TCP server response timeout"));
      }, 5000);
    });
  }

  sendMessageNoResponse(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.conn) {
        reject(new Error("Not connected"));
        return;
      }

      this.conn.write(command, (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }
}

export class HeatingSystemController {
  private client: TcpClient;

  constructor(host: string, port: number = 62910) {
    this.client = new TcpClient(host, port);
  }

  async connect(): Promise<void> {
    const info = await this.client.connect();
    console.log(`Connected to Cube`, info);
  }

  async getConfiguration(): Promise<{ address: string; configData: string }> {
    const response = await this.client.sendMessageWithResponse("c:");
    const [address, configData] = response.slice(2).split(",");
    return { address, configData };
  }

  async getDeviceList(): Promise<Device[]> {
    const response = await this.client.sendMessageWithResponse("l:");
    console.log("Response", response);
    const base64Data = response.slice(2).trim();
    const decodedData = decode(base64Data);
    const devices: Device[] = [];

    const hasMoreData = this.bytesToDecimal(decodedData.slice(0, 1)) > 6;

    for (let i = 0; i < decodedData.length; i += 12) {
      const rfAddress = this.bytesToHex(decodedData.slice(i + 1, i + 4));
      let device: Device = {
        rfAddress,
      };
      if (hasMoreData) {
        const tempBytes = decodedData.slice(i + 8, i + 9);
        const temperature = this.bytesToDecimal(tempBytes) / 2;
        const msrdTempBytes = decodedData.slice(i + 9, i + 11);
        const measuredTemperature =
          (msrdTempBytes[0] * 256 + msrdTempBytes[1]) /
          10;
        const valvePosition = this.bytesToDecimal(
          decodedData.slice(i + 7, i + 8),
        );
        device = {
          ...device,
          targetTemperature: temperature,
          measuredTemperature: measuredTemperature,
          valvePosition: valvePosition,
        };
      }
      devices.push(device);
    }

    return devices;
  }

  newDevice(): Promise<{ rfAddress: string }> {
    return new Promise<{ rfAddress: string }>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timeout"));
      }, 59000);
      this.client.sendMessageWithResponse("n:003c").then((response) => {
        clearTimeout(timeout);
        const base64Data = response.slice(2).trim();
        const decodedData = decode(base64Data);
        const rfAddressBytes = decodedData.slice(1, 4);
        resolve({
          rfAddress: this.bytesToHex(rfAddressBytes),
        });
      });
    });
  }

  async deleteDevices(
    rfAddresses: string[],
    force: boolean = false,
  ): Promise<void> {
    const numberOfDevices = rfAddresses.length.toString(16).padStart(2, "0");
    const forceFlag = force ? "1" : "0";
    const rfAddressesBytes = rfAddresses.flatMap((address) =>
      this.rfAddressToBytes(address)
    );
    const rfAddressesBase64 = encode(new Uint8Array(rfAddressesBytes));
    const message = `t:${numberOfDevices},${forceFlag},${rfAddressesBase64}`;
    await this.client.sendMessageNoResponse(message);
  }

  // Get cube information (H Message)
  getCubeInfo(data: string): CubeInfo {
    const parts = data.slice(2).split(",");
    return {
      serialNumber: parts[0],
      rfAddress: parts[1],
      firmwareVersion: parseInt(parts[2], 16).toString(),
      dutyCycle: parts[5],
      freeMemorySlots: parts[6],
    };
  }

  // Set temperature (S Message)
  async setTemperature(
    rfAddress: string,
    temperature: number,
    mode: Mode = "manual",
  ): Promise<void> {
    const command = 0x40; // Command 40: Set temperature
    const rfFlags = 0x00; // RF flags
    const fromAddress = [0x00, 0x00, 0x00]; // RF Address from
    const toAddress = this.rfAddressToBytes(rfAddress); // RF Address to
    const roomId = 0x00; // Room ID
    const modeBits = this.getModeBits(mode);
    const tempValue = Math.round(temperature * 2);
    const temperatureByte = (modeBits << 6) | tempValue;

    const payload = new Uint8Array([
      0x00, // Unknown
      rfFlags,
      command,
      ...fromAddress,
      ...toAddress,
      roomId,
      temperatureByte,
    ]);

    const payloadBase64 = encode(payload);
    const message = `s:${payloadBase64}`;
    try {
      await this.client.sendMessageWithResponse(message);
    } catch (error) {
      await this.connect();
      await this.client.sendMessageWithResponse(message);
    }
  }

  // Helper to convert RF address string to bytes
  private rfAddressToBytes(rfAddress: string): number[] {
    const addressNum = parseInt(rfAddress, 16);
    return [
      (addressNum >> 16) & 0xff,
      (addressNum >> 8) & 0xff,
      addressNum & 0xff,
    ];
  }

  // Helper to convert bytes to hex string
  private bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  // Helper to get mode bits
  private getModeBits(mode: Mode): number {
    switch (mode) {
      case "auto":
        return 0b00;
      case "manual":
        return 0b01;
      case "vacation":
        return 0b10;
      case "boost":
        return 0b11;
      default:
        return 0b00;
    }
  }

  private bytesToDecimal(bytes: Uint8Array): number {
    let decimal = 0;
    for (let i = 0; i < bytes.length; i++) {
      decimal = (decimal << 8) | bytes[i];
    }
    return decimal;
  }

  async wakeUp(rfAddress: string, duration: number = 30): Promise<string> {
    const durationHex = duration.toString(16).padStart(2, "0");
    const rfAddressBytes = this.rfAddressToBytes(rfAddress);
    const rfAddressHex = rfAddressBytes
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    const message = `z:${durationHex},D,${rfAddressHex}`;
    const answer = await this.client.sendMessageWithResponse(message);
    return answer;
  }
}

export const controller: HeatingSystemController = new HeatingSystemController(
  Deno.env.get("CUBE_IP_ADDRESS") ?? "",
);
