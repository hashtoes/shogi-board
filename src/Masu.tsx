import React from "react";
import classnames from "classnames";
import { Subscribe } from "unstated";
import Koma from "./Koma";
import KomaObj from "./domain/Koma";
import styles from "./Masu.module.scss";
import { AppStateContainer } from "./store";
import { Coordinate } from "./types";

interface Props {
  koma: KomaObj | null;
  coordinate: Coordinate;
  senteKiki: number;
  goteKiki: number;
}

const MAX_KIKI = 4;

const Masu: React.FC<Props> = ({ koma, coordinate, senteKiki, goteKiki }) => {
  return (
    <Subscribe to={[AppStateContainer]}>
      {(container: AppStateContainer) => {
        return <div
          className={classnames([
            styles.masu,
            styles[`sente-${Math.min(senteKiki, MAX_KIKI)}`],
            styles[`gote-${Math.min(goteKiki, MAX_KIKI)}`]
          ])}
          onClick={() => {
            container.onMasuClicked(coordinate);
          }}
        >
          {koma && <Koma koma={koma} />}
        </div>
      }}
    </Subscribe>
  );
};

export default Masu;
