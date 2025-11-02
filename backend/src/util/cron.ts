import { Database, StoreCron } from "./database.ts";
import { controller } from "./heatingsystem.ts";
import { DateTime } from "luxon";

const cronController = new Map<string, AbortController>();

const newCron = (cron: StoreCron) => {
  Database.addCron(cron);
  initializeCron(cron);
};

const initializeCrons = () => {
  const crons = Database.getCrons();
  for (const cron of crons) {
    initializeCron(cron);
  }
};

function convertTimezoneCronToUTC(cronString: string, timezone: string): string {
  const [minute, hour, day, month, dayOfWeek] = cronString.split(' ');

  if (hour === '*' || hour.includes(',') || hour.includes('-') || hour.includes('/')) {
    throw new Error('Can only convert specific hour values');
  }

  const timezoneTime = DateTime.now()
    .setZone(timezone)
    .set({ hour: parseInt(hour), minute: parseInt(minute) });

  const utcTime = timezoneTime.toUTC();

  return `${utcTime.minute} ${utcTime.hour} ${day} ${month} ${dayOfWeek}`;
}

const initializeCron = async (cron: StoreCron) => {
  console.log(`Initializing cron ${cron.cron} ${cron.name}`);
  const abortController = new AbortController();
  const timezone = Database.getTimezone();
  const utcCron = convertTimezoneCronToUTC(cron.cron, timezone);

  console.log(`Converted cron in ${timezone}: ${cron.cron} to UTC ${utcCron}`);

  cronController.set(cron.name, abortController);
  try {
    await Deno.cron(cron.name, utcCron, {
      signal: abortController.signal,
    }, async () => {
      console.log(`Running cron ${utcCron}`);
      cron = Database.getCronByName(cron.name)!;
      if (!cron.enabled) {
        console.log(`Cron ${cron.name} disabled`);
        return;
      }
      if (cron.oneTime) {
        removeCron(cron.name);
      }
      for (const address of cron.rfAdresses) {
        try {
          controller.setTemperature(address, cron.temperature);
        } catch (_error) {
          await controller.connect();
          controller.setTemperature(address, cron.temperature);
        }
      }
    });
  } catch (error) {
    console.error(`Error in cron ${cron.name}: ${error}`);
  }
};

const removeCron = (name: string) => {
  Database.removeCron(name);
  console.log(`Abort cron ${name}`);
  cronController.get(name)?.abort();
};

export const CronHandler = {
  newCron,
  initializeCrons,
  removeCron,
};
