import { DB } from "https://deno.land/x/sqlite/mod.ts";

let db: DB | null;

export interface StoreDevice {
  rfAddress: string;
  name: string;
}

export interface StoreCron {
  rfAdresses: string[];
  cron: string;
  temperature: number;
  name: string;
  oneTime: boolean;
  enabled: boolean;
}

const create = (name: string) => {
  db = new DB(name);
  db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timezone TEXT NOT NULL
    );
  `);
  db.execute(`
    CREATE TABLE IF NOT EXISTS devices (
      rfAddress TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );
  `);
  db.execute(`
    CREATE TABLE IF NOT EXISTS crons (
      name TEXT PRIMARY KEY,
      cron TEXT NOT NULL,
      deviceAdresses TEXT NOT NULL,
      temperature REAL NOT NULL,
      oneTime BOOLEAN DEFAULT FALSE,
      enabled BOOLEAN DEFAULT TRUE
    );
  `);
  db.execute(`
    ALTER TABLE settings ADD COLUMN offTemperature REAL NOT NULL DEFAULT 17, onTemperature REAL NOT NULL DEFAULT 20;
  `);
};

const addCron = (
  { cron, rfAdresses, temperature, name, oneTime }: StoreCron,
) => {
  if (!db) {
    throw new Error("DB not initialized");
  }
  db.query(
    "INSERT INTO crons (cron, deviceAdresses, temperature, name, oneTime) VALUES (?,?,?,?,?)",
    [
      cron,
      JSON.stringify(rfAdresses),
      temperature,
      name,
      oneTime,
    ],
  );
};

const removeCron = (name: string) => {
  if (!db) {
    throw new Error("DB not initialized");
  }
  db.query("DELETE FROM crons WHERE name = ?", [name]);
};

const getCrons = (): StoreCron[] => {
  if (!db) {
    throw new Error("DB not initialized");
  }
  return db.query(
    "SELECT cron, deviceAdresses, temperature, name, oneTime, enabled FROM crons",
  )
    .map(
      (
        [cron, deviceAdresses, temperature, name, oneTime, enabled],
      ): StoreCron => {
        return {
          cron: cron as string,
          rfAdresses: JSON.parse(deviceAdresses as string),
          temperature: temperature as number,
          name: name as string,
          oneTime: oneTime as boolean,
          enabled: (enabled as number) === 1,
        };
      },
    );
};

const updateCron = (cron: StoreCron) => {
  if (!db) {
    throw new Error("DB not initialized");
  }
  db.query(
    "UPDATE crons SET cron = ?, deviceAdresses = ?, temperature = ?, oneTime = ?, enabled = ? WHERE name = ?",
    [
      cron.cron,
      JSON.stringify(cron.rfAdresses),
      cron.temperature,
      cron.oneTime,
      cron.enabled,
      cron.name,
    ],
  );
};

const getCronByName = (name: string): StoreCron | undefined => {
  if (!db) {
    throw new Error("DB not initialized");
  }
  const cron = db.query(
    "SELECT cron, deviceAdresses, temperature, name, oneTime, enabled FROM crons WHERE name = ?",
    [name],
  );
  if (cron.length === 0) {
    return undefined;
  }
  return {
    cron: cron[0][0] as string,
    rfAdresses: JSON.parse(cron[0][1] as string),
    temperature: cron[0][2] as number,
    name: cron[0][3] as string,
    oneTime: cron[0][4] as boolean,
    enabled: (cron[0][5] as number) === 1,
  };
};

const insert = (device: StoreDevice) => {
  if (!db) {
    throw new Error("DB not initialized");
  }
  db.query("INSERT INTO devices (rfAddress, name) VALUES (?, ?)", [
    device.rfAddress,
    device.name,
  ]);
};

const remove = (rfAddress: string) => {
  if (!db) {
    throw new Error("DB not initialized");
  }
  db.query("DELETE FROM devices WHERE rfAddress = ?", [rfAddress]);
};

const getAllDevices = (): StoreDevice[] => {
  if (!db) {
    throw new Error("DB not initialized");
  }
  return db.query("SELECT rfAddress, name FROM devices").map(
    ([rfAddress, name]): StoreDevice => {
      return {
        rfAddress: rfAddress as string,
        name: name as string,
      };
    },
  );
};

const getTemperatureSettings = (): { offTemperature: number, onTemperature: number } => {
  if (!db) {
    throw new Error("DB not initialized");
  }
  return db.query("SELECT offTemperature, onTemperature FROM settings").map(
    ([offTemperature, onTemperature]): { offTemperature: number, onTemperature: number } => {
      return {
        offTemperature: offTemperature as number,
        onTemperature: onTemperature as number,
      };
    },
  )?.[0] || { offTemperature: 17, onTemperature: 20 };
};

const setTemperatureSettings = (offTemperature: number, onTemperature: number) => {
  if (!db) {
    throw new Error("DB not initialized");
  }
  db.execute(`
    UPDATE settings SET offTemperature = ${offTemperature}, onTemperature = ${onTemperature} WHERE id = 1
  `);
};

const getTimezone = (): string => {
  if (!db) {
    throw new Error("DB not initialized");
  }
  return db.query("SELECT timezone FROM settings").map(
    ([timezone]): string => timezone as string,
  )?.[0] || "Europe/Berlin";
};

const setTimezone = (timezone: string) => {
  if (!db) {
    throw new Error("DB not initialized");
  }
  // create settings entry if it doesn't exist
  const settings = db.query("SELECT timezone FROM settings WHERE id = 1");
  if (settings.length === 0) {
    db.query("INSERT INTO settings (timezone) VALUES (?)", [timezone]);
  } else {
    db.query("UPDATE settings SET timezone = ? WHERE id = 1", [timezone]);
  }
};

export const Database = {
  create,
  insert,
  remove,
  getAllDevices,
  addCron,
  getCrons,
  removeCron,
  getCronByName,
  updateCron,
  getTimezone,
  setTimezone,
  getTemperatureSettings,
  setTemperatureSettings,
};
