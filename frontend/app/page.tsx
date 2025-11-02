import { getAllCrons, getAllDevices } from "./actions";
import CronContainer from "./components/cron/CronContainer";
import DeviceContainer from "./components/devices/DeviceContainer";
import styles from "./page.module.scss";
import TimeZone from "./components/settings/TimeZone";

export default async function Home() {
  const results = await Promise.allSettled([getAllCrons(), getAllDevices()]);
  if (results.some((result) => result.status === "rejected")) {
    return <div>Failed to fetch data</div>;
  }

  const [cronsResult, devicesResult] = results;

  const crons =
    cronsResult.status === "fulfilled" ? cronsResult.value.crons : [];
  const devices =
    devicesResult.status === "fulfilled" ? devicesResult.value.devices : [];

  return (
    <div className={styles.page}>
      <>
        <TimeZone />
        <CronContainer crons={crons} />
        <DeviceContainer devices={devices} />
      </>
    </div>
  );
}
