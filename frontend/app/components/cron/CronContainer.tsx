"use client";

import { useCronStore } from "@/app/util/stores/cronStore";
import { ReactElement, useEffect } from "react";
import WidgetContainer from "../WidgetContainer";
import AddCron from "./AddCron";
import CronItem from "./CronItem";
import { Cron } from "@/app/util/types";
import { getAllCrons } from "@/app/actions";

interface Props {
  crons: Cron[];
}

const CronContainer = ({ crons }: Props): ReactElement => {
  const cronStore = useCronStore((state) => state);

  useEffect(() => {
    cronStore.setCrons(crons);
  }, []);

  const refreshData = async () => {
    const crons = await getAllCrons();
    if (!crons.success) {
      return;
    }
    cronStore.setCrons(crons.crons);
  };

  return (
    <WidgetContainer onClick={refreshData} label="cronjobs">
      {cronStore.crons.map((cron) => (
        <CronItem key={cron.name} cron={cron} />
      ))}
      <AddCron />
    </WidgetContainer>
  );
};

export default CronContainer;
