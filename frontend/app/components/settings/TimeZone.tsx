"use client";

import { getTimezone, setTimezone } from "@/app/actions";
import { useEffect, useState } from "react";

import styles from "./TimeTone.module.scss";


const TimeZone = () => {
  const [timezone, setStateTimezone] = useState("");

  useEffect(() => {
    getTimezone().then((timezone) => setStateTimezone(timezone));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStateTimezone(e.target.value);
    setTimezone(e.target.value);
  };

  return (
    <select className={styles.select} value={timezone} onChange={handleChange}>
      {Intl.supportedValuesOf('timeZone').map((timezone) => (
          <option key={timezone} value={timezone}>{timezone}</option>
      ))}
    </select>
  );
};

export default TimeZone;
