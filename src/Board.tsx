import React from "react";
import { Provider, Subscribe } from "unstated";
import range from "lodash/range";
import Masu from "./Masu";
import Mochigoma from "./Mochigoma";
import { BOARD_SIDE } from "./constants";
import styles from "./Board.module.scss";
import { AppStateContainer } from "./store";
import { RowIdx, ColIdx } from "./types";

const Board: React.FC<{}> = () => (
  <Provider>
    <Subscribe to={[AppStateContainer]}>
      {(container: AppStateContainer) => {
        const { senteKiki, goteKiki } = container.calcKiki();
        return (
          <div className={styles.board}>
            <div className={styles["nari-confirm"]}>
              {container.isNariConfirmShown() && [
                <div
                  key="yes"
                  className={styles.opts}
                  onClick={() => container.onNariConfirmClicked(true)}
                >
                  はい
                </div>,
                <div
                  key="no"
                  className={styles.opts}
                  onClick={() => container.onNariConfirmClicked(false)}
                >
                  いいえ
                </div>
              ]}
            </div>
            <div className={styles.main}>
              <Mochigoma komas={container.getGoteMochigomas()} />
              <table className={styles.table}>
                <tbody>
                  {range(1, BOARD_SIDE + 1).map((row: RowIdx) => (
                    <tr key={row}>
                      {range(1, BOARD_SIDE + 1).map((col: ColIdx) => (
                        <td key={col} className={styles.td}>
                          <Masu
                            koma={container.getKoma([col, row])}
                            coordinate={[col, row]}
                            senteKiki={senteKiki[col][row]}
                            goteKiki={goteKiki[col][row]}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <Mochigoma komas={container.getSenteMochigomas()} />
            </div>
          </div>
        );
      }}
    </Subscribe>
  </Provider>
);

export default Board;
