import range from "lodash/range";
import { Coordinate, ColIdx, RowIdx } from "../types";
import Koma from "./Koma";
import { BOARD_SIDE } from "../constants";

const allCoordinates: Coordinate[] = range(1, BOARD_SIDE + 1).flatMap(
  (col: ColIdx): Coordinate[] =>
    range(1, BOARD_SIDE + 1).map((row: RowIdx) => [col, row])
);

const withinBoard = ([col, row]: Coordinate): boolean => {
  return 1 <= col && col <= BOARD_SIDE && 1 <= row && row <= BOARD_SIDE;
};

export enum MoveKomaResult {
  OK,
  NG,
  NARI_CONFIRM
}

export default class Board {
  private readonly board: (Koma | null)[][];
  private readonly coordinatesByKomaId: {
    [komaId: number]: Coordinate | "mochigoma";
  };

  constructor(
    initialKomas: [Coordinate, Koma][],
    private readonly mochigomas: Koma[]
  ) {
    this.board = initialKomas.reduce((board: (Koma | null)[][], curr) => {
      const [[col, row], koma] = curr;
      board[col][row] = koma;
      return board;
    }, range(BOARD_SIDE + 1).map(_ => range(BOARD_SIDE + 1).map(_ => null)));

    this.coordinatesByKomaId = initialKomas.reduce(
      (
        coordByKomaId: { [komaId: number]: Coordinate | "mochigoma" },
        [coord, koma]
      ) => {
        coordByKomaId[koma.id] = coord;
        return coordByKomaId;
      },
      mochigomas.reduce(
        (coordByKomaId: { [komaId: number]: "mochigoma" }, koma) => {
          coordByKomaId[koma.id] = "mochigoma";
          return coordByKomaId;
        },
        {}
      )
    );
  }

  getKoma([col, row]: Coordinate): Koma | null {
    return this.board[col][row];
  }

  getCoordinateFor(koma: Koma): Coordinate | "mochigoma" {
    return this.coordinatesByKomaId[koma.id];
  }

  moveKoma(koma: Koma, moveTo: Coordinate): MoveKomaResult {
    const moveFrom = this.getCoordinateFor(koma);
    if (moveFrom === "mochigoma") {
      return this.putMochigoma(koma, moveTo);
    }

    if (this.canMoveTo(moveFrom, moveTo)) {
      this.blindlyMoveKoma(koma, moveFrom, moveTo);
      if (this.canNaru(koma, moveFrom, moveTo)) {
        return MoveKomaResult.NARI_CONFIRM;
      }
      return MoveKomaResult.OK;
    }
    return MoveKomaResult.NG;
  }

  private blindlyMoveKoma(koma: Koma, from: Coordinate, to: Coordinate): void {
    this.board[from[0]][from[1]] = null;
    this.board[to[0]][to[1]] = koma;

    this.coordinatesByKomaId[koma.id] = to;
  }

  private blindlyKomaTaken(koma: Koma): void {
    koma.taken();
    this.coordinatesByKomaId[koma.id] = "mochigoma";
    this.mochigomas.push(koma);
  }

  private blindlyPutMochigoma(mochigomaIdx: number, coord: Coordinate): void {
    const koma = this.mochigomas[mochigomaIdx];
    this.board[coord[0]][coord[1]] = koma;
    this.coordinatesByKomaId[koma.id] = coord;
    this.mochigomas.splice(mochigomaIdx, 1);
  }

  takeKoma(takerKoma: Koma, takenKoma: Koma): MoveKomaResult {
    const takerCoord = this.getCoordinateFor(takerKoma);
    const takenCoord = this.getCoordinateFor(takenKoma);

    if (takenCoord === "mochigoma" || takerCoord === "mochigoma") {
      return MoveKomaResult.NG;
    }

    const moveResult = this.moveKoma(takerKoma, takenCoord);
    if (moveResult === MoveKomaResult.NG) {
      return MoveKomaResult.NG;
    }
    this.blindlyKomaTaken(takenKoma);
    return moveResult;
  }

  putMochigoma(koma: Koma, coord: Coordinate): MoveKomaResult {
    if (this.getKoma(coord) !== null) {
      return MoveKomaResult.NG;
    }
    const idx = this.mochigomas.findIndex(
      mochigoma => mochigoma.id === koma.id
    );
    if (idx < 0) {
      return MoveKomaResult.NG;
    }
    this.blindlyPutMochigoma(idx, coord);
    return MoveKomaResult.OK;
  }

  private canNaru(
    koma: Koma,
    [_, fromRow]: Coordinate,
    [__, toRow]: Coordinate
  ) {
    return (
      !koma.isNari() &&
      ((koma.isSente() && (fromRow <= 3 || toRow <= 3)) ||
        (koma.isGote() && (fromRow >= 7 || toRow >= 7)))
    );
  }

  getSenteMochigomas(): Koma[] {
    return this.mochigomas.filter(koma => koma.isSente());
  }

  getGoteMochigomas(): Koma[] {
    return this.mochigomas.filter(koma => !koma.isSente());
  }

  private canMoveTo(from: Coordinate, to: Coordinate): boolean {
    const maybeKoma = this.getKoma(from);
    if (maybeKoma === null) {
      return false;
    }
    return this.calcKikiForSingleKoma(from).some(
      ([col, row]) => to[0] === col && to[1] === row
    );
  }

  calcKikiForSingleKoma([col, row]: Coordinate): Coordinate[] {
    /**
     * Declaring Section (You don't have to read until it appears in `Procedure Section`)
     */
    enum Movability {
      OK,
      OK_AND_STOP,
      NOT_OK
    }

    const koma = this.getKoma([col, row]);
    if (koma === null) {
      return [];
    }

    // This function needs to be called in order from the nearest Coordinate
    // from the koma itself.
    const checkMovability = (
      koma: Koma,
      [col, row]: Coordinate
    ): Movability => {
      if (!withinBoard([col, row])) {
        return Movability.NOT_OK;
      }
      const maybeKoma = this.getKoma([col, row]);
      if (maybeKoma === null) {
        return Movability.OK;
      }
      if (maybeKoma.isSente() === koma.isSente()) {
        return Movability.NOT_OK;
      }
      return Movability.OK_AND_STOP;
    };

    /**
     * Procedure section
     */
    return koma.getMovements().reduce((acc: Coordinate[], consMoves) => {
      consMoves.some(([colDiff, rowDiff]) => {
        const movability = checkMovability(koma, [
          col + colDiff,
          row + rowDiff
        ]);
        if (movability === Movability.NOT_OK) {
          return true; // break and go to next `consMoves`
        }
        acc.push([col + colDiff, row + rowDiff]);
        return movability === Movability.OK_AND_STOP;
      });
      return acc;
    }, []);
  }

  calcKiki(): {
    senteKiki: number[][];
    goteKiki: number[][];
  } {
    const initKiki = (): number[][] =>
      range(BOARD_SIDE + 1).map(_ => range(BOARD_SIDE + 1).map(_ => 0));

    return allCoordinates.reduce(
      ({ senteKiki, goteKiki }, coord) => {
        const maybeKoma = this.getKoma(coord);
        if (maybeKoma == null) {
          return { senteKiki, goteKiki };
        }
        const kiki = maybeKoma.isSente() ? senteKiki : goteKiki;
        this.calcKikiForSingleKoma(coord).forEach(
          ([col, row]) => kiki[col][row]++
        );
        return { senteKiki, goteKiki };
      },
      { senteKiki: initKiki(), goteKiki: initKiki() }
    );
  }
}
