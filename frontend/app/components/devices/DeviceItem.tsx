"use client";

import { useEffect, useState } from "react";
import styles from "./DeviceItem.module.scss";

import { useDeviceStore } from "@/app/util/stores/deviceStore";
import { Device } from "@/app/util/types";
import classNames from "classnames";
import Trash from "../icons/Trash";
import { disconnectDevice, setTemperature } from "@/app/actions";

interface Props {
  device: Device;
}

const DeviceItem = ({ device }: Props) => {
  const deviceStore = useDeviceStore((state) => state);
  const [targetTemperature, setTargetTemperature] = useState(
    device.targetTemperature
  );
  const [initialMount, setInitialMount] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setInputValue(targetTemperature.toString());
    if (initialMount) {
      setInitialMount(false);
      return;
    }
    setIsLoading(true);

    setTemperature({
      targetTemperature,
      rfAddress: device.rfAddress,
    }).then((result) => {
      setIsLoading(false);
      if (result.success) {
        return;
      }

      setTargetTemperature(device.targetTemperature);
      setError(result.error ?? "An unknown error occurred");
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetTemperature]);

  const onIncreaseClicked = async () => {
    setTargetTemperature(targetTemperature + 0.5);
  };

  const onDecreaseClicked = () => {
    setTargetTemperature(targetTemperature - 0.5);
  };

  const onTrashClicked = async () => {
    setIsLoading(true);
    deviceStore.removeDevice(device.rfAddress);
    await disconnectDevice({
      rfAddress: device.rfAddress,
    });
    setIsLoading(false);
  };

  const onBlur = () => {
    setTargetTemperature(Number(inputValue));
  };

  useEffect(() => {
    setTargetTemperature(device.targetTemperature);
  }, [device.targetTemperature]);

  return (
    <div className={styles.container}>
      <div className={styles.deviceHeader}>
        <div>{device.name}</div>
        <div className={styles.delete} onClick={onTrashClicked}>
          <Trash size={17} />
        </div>
      </div>
      <div className={styles.stats}>
        {error === "" ? (
          <>
            <div>{device.valvePosition} %</div>
            {device.measuredTemperature !== 0 && (
              <div>{device.measuredTemperature} °C</div>
            )}
          </>
        ) : (
          <div className={styles.errorContainer}>{error}</div>
        )}
      </div>
      <div
        className={classNames(styles.temperatureControl, {
          [styles.loading!]: isLoading,
        })}
      >
        <button onClick={onDecreaseClicked}>-</button>
        <input
          type="number"
          pattern="[0-9]+([\.,][0-9]+)?"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
          onBlur={onBlur}
        />
        <button onClick={onIncreaseClicked}>+</button>
      </div>
    </div>
  );
};

export default DeviceItem;
