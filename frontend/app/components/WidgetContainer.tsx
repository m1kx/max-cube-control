import classNames from "classnames";
import styles from "./WidgetContainer.module.scss";

import { PropsWithChildren, ReactElement } from "react";
import Refresh from "./icons/Refresh";

interface Props extends PropsWithChildren {
  label: string;
  useGrid?: boolean;
  onClick?: () => void;
}

const WidgetContainer = ({
  children,
  label,
  useGrid = false,
  onClick,
}: Props): ReactElement => (
  <div onClick={onClick}>
    <div className={styles.widgetLabel}>
      {label}
      {onClick && <Refresh size={12} />}
    </div>
    <div
      className={classNames(styles.container, {
        [styles.wrap!]: useGrid,
      })}
    >
      {children}
    </div>
  </div>
);

export default WidgetContainer;
