"use client";

import { useDeviceStore } from "@/app/util/stores/deviceStore";
import { ReactElement, useEffect } from "react";
import WidgetContainer from "../WidgetContainer";
import AddDevice from "./AddDevice";
import DeviceItem from "./DeviceItem";
import { Device } from "@/app/util/types";
import { getAllDevices } from "@/app/actions";

interface Props {
  devices: Device[];
}

const DeviceContainer = ({ devices }: Props): ReactElement => {
  const deviceStore = useDeviceStore((state) => state);

  useEffect(() => {
    deviceStore.setDevices(devices);
  }, []);

  const refreshData = async () => {
    const devices = await getAllDevices();
    if (!devices.success) {
      return;
    }
    deviceStore.setDevices(devices.devices);
  };

  return (
    <WidgetContainer onClick={refreshData} useGrid label="devices">
      {deviceStore.devices.map((device) => (
        <DeviceItem key={device.name} device={device} />
      ))}
      <AddDevice />
    </WidgetContainer>
  );
};

export default DeviceContainer;
