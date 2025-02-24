"use client";

import { useCronStore } from "@/app/util/stores/cronStore";
import { useDeviceStore } from "@/app/util/stores/deviceStore";
import { Cron } from "@/app/util/types";
import classNames from "classnames";
import { ReactElement, useState } from "react";
import Plus from "../icons/Plus";
import styles from "./AddCron.module.scss";

import cronParser from "cron-parser";
import cronstrue from "cronstrue";
import { addNewCron, updateCron } from "@/app/actions";

interface Props {
  cron?: Cron;
  onUpdateDone?: () => void;
}

const AddCron = ({ cron, onUpdateDone }: Props): ReactElement => {
  const isUpdate = cron ? true : false;

  const deviceStore = useDeviceStore();
  const cronStore = useCronStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isInputActive, setIsInputActive] = useState(cron ? true : false);
  const [nameValue, setNameValue] = useState(cron?.name ?? "");
  const [cronValue, setCronValue] = useState(cron?.cron ?? "* * * * *");
  const [tempValue, setTempValue] = useState(cron?.temperature ?? 21);
  const [oneTimeValue, setOneTimeValue] = useState(cron?.oneTime ?? false);

  const [checkedDevices, setCheckedDevices] = useState<string[]>(
    cron?.rfAdresses ?? []
  );

  const plusClicked = () => {
    setIsInputActive(true);
  };

  const addClicked = async () => {
    if (!nameValue || !tempValue || !cronValue || !!oneTimeValue) {
      return;
    }
    setIsLoading(true);
    const newCron: Cron = {
      cron: cronValue,
      name: nameValue,
      temperature: tempValue,
      oneTime: oneTimeValue,
      enabled: true,
      rfAdresses: checkedDevices,
    };
    if (isUpdate) {
      cronStore.updateCron(newCron);
      await updateCron(newCron);
      onUpdateDone?.();
    } else {
      cronStore.addCron(newCron);
      await addNewCron(newCron);
    }
    setIsInputActive(false);
    setIsLoading(false);
  };

  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleCronChange = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setCronValue(value);

    try {
      cronParser.parseExpression(value);
      setError("");
      const desc = cronstrue.toString(value);
      setDescription(desc);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      setError("Invalid cron expression");
      setDescription("");
    }
  };

  return (
    <div className={styles.container}>
      <div
        onClick={plusClicked}
        className={classNames(styles.addCron, {
          [styles.inputActive!]: isInputActive,
          [styles.loading!]: isLoading,
        })}
      >
        {isInputActive ? (
          <div className={styles.optionContainer}>
            <div>
              {deviceStore.devices.map((device) => (
                <div key={device.name} className={styles.deviceSelectElement}>
                  <label htmlFor={device.rfAddress}>{device.name}</label>
                  <input
                    onChange={(e) => {
                      if (e.currentTarget.checked) {
                        setCheckedDevices([
                          ...checkedDevices,
                          device.rfAddress,
                        ]);
                      } else {
                        setCheckedDevices(
                          checkedDevices.filter(
                            (address) => address !== device.rfAddress
                          )
                        );
                      }
                    }}
                    checked={checkedDevices.includes(device.rfAddress)}
                    id={`${device.rfAddress}`}
                    type="checkbox"
                  />
                </div>
              ))}
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {description && <p>{description}</p>}
            <div className={styles.inputContainer}>
              <input
                type="text"
                placeholder="cron"
                value={cronValue}
                onChange={handleCronChange}
              />
              <input
                value={nameValue}
                onChange={(e) => setNameValue(e.currentTarget.value)}
                type="text"
                placeholder="name"
              />
              <input
                value={tempValue}
                onChange={(e) => setTempValue(Number(e.currentTarget.value))}
                type="number"
                placeholder="temp"
              />
              <div className={styles.oneTime}>
                <label htmlFor="onetime">One time?</label>
                <input
                  checked={oneTimeValue}
                  onChange={(e) => setOneTimeValue(e.currentTarget.checked)}
                  id={`onetime`}
                  type="checkbox"
                />
              </div>
              <div className={styles.buttonContainer}>
                {isUpdate && <button onClick={onUpdateDone}>cancel</button>}
                <button onClick={addClicked}>
                  {isUpdate ? "update" : "add"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Plus size={30} />
        )}
      </div>
    </div>
  );
};

export default AddCron;
