"use client";

import classNames from "classnames";
import styles from "./CronItem.module.scss";

import { useCronStore } from "@/app/util/stores/cronStore";
import { Cron } from "@/app/util/types";
import Trash from "../icons/Trash";
import { deleteCron, updateCron } from "@/app/actions";

interface Props {
  cron: Cron;
}

const CronItem = ({ cron }: Props) => {
  const cronStore = useCronStore((state) => state);

  const onTrashClicked = async () => {
    deleteCron(cron.name).then(() => {
      cronStore.removeCron(cron.name);
    });
  };

  const onHeadingClicked = async () => {
    await updateCron({ name: cron.name, enabled: !cron.enabled });
  };

  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <div
          className={classNames(styles.nameHeading, {
            [styles.isEnabled!]: cron.enabled,
          })}
          onClick={onHeadingClicked}
        >
          {cron.name}
        </div>
        <div className={classNames(styles.reducedColor, styles.bold)}>
          {cron.rfAdresses.join(", ")}
        </div>
      </div>
      <div className={styles.subContainer}>
        <div>↳ {cron.temperature}°C</div>
        <div>{cron.cron}</div>
      </div>
      <div onClick={onTrashClicked} className={styles.removeContainer}>
        <Trash size={20} />
      </div>
    </div>
  );
};

export default CronItem;
