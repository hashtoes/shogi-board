import React from "react";
import classnames from "classnames";
import { Subscribe } from "unstated";
import KomaObj from "./domain/Koma";
import { AppStateContainer } from "./store";
import styles from "./Koma.module.scss";

interface Props {
  koma: KomaObj;
}

const isMovable = (koma: KomaObj, container: AppStateContainer) => {
  const holdingKoma = container.getHoldingKoma();
  if (holdingKoma) {
    return true;
  }
  return (
    (koma.isSente() && container.isSenteban()) ||
    (koma.isGote() && container.isGoteban())
  );
};

const Koma: React.FC<Props> = ({ koma }) => {
  return (
    <Subscribe to={[AppStateContainer]}>
      {(container: AppStateContainer) => {
        const holdingKoma = container.getHoldingKoma();

        return (
          <div
            className={classnames(styles.koma, {
              [styles.movable]: isMovable(koma, container),
              [styles.gote]: koma.isGote(),
              [styles.holding]: holdingKoma && holdingKoma.id === koma.id
            })}
            onClick={() => container.onKomaClicked(koma)}
          >
            {koma.getCharacter()}
          </div>
        );
      }}
    </Subscribe>
  );
};

export default Koma;
