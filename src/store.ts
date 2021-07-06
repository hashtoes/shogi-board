import { Container } from "unstated";
import Koma, { HIRATE } from "./domain/Koma";
import { Coordinate } from "./types";
import Board, { MoveKomaResult } from "./domain/Board";

type State = {
  teme: number;
  holdingKoma: Koma | null;
  board: Board;
  nariConfirmShown: boolean;
};

const initState: State = {
  teme: 1,
  holdingKoma: null,
  board: new Board(HIRATE, []),
  nariConfirmShown: false
};

export class AppStateContainer extends Container<State> {
  state = initState;

  /**
   * Event handlers
   */
  onKomaClicked = (koma: Koma) => {
    if (this.isNariConfirmShown()) {
      return;
    }
    const holdingKoma = this.getHoldingKoma();
    if (holdingKoma === null && koma.isSente() !== this.isSenteban()) {
      return;
    }
    if (holdingKoma === null) {
      this.setState({ holdingKoma: koma });
      return;
    }
    if (holdingKoma.id === koma.id) {
      // Cancel moving this koma
      this.setState({
        holdingKoma: null
      });
      return;
    }
    if (holdingKoma.isSente() !== koma.isSente()) {
      // Take this koma
      this.handleMoveKomaResult(this.state.board.takeKoma(holdingKoma, koma));
    }
  };

  onMasuClicked = (coord: Coordinate) => {
    if (this.isNariConfirmShown()) {
      return;
    }
    if (this.state.board.getKoma(coord) !== null) {
      // In UI, Koma overlays Masu, so this shouldn't happen.
      return;
    }
    const holdingKoma = this.getHoldingKoma();
    if (holdingKoma === null) {
      return;
    }

    this.handleMoveKomaResult(this.state.board.moveKoma(holdingKoma, coord));
  };

  private handleMoveKomaResult = (result: MoveKomaResult): void => {
    switch (result) {
      case MoveKomaResult.NG:
        return;
      case MoveKomaResult.NARI_CONFIRM:
        this.setState({
          board: this.state.board,
          nariConfirmShown: true
        });
        return;
      case MoveKomaResult.OK:
        this.setState({
          teme: this.state.teme + 1,
          holdingKoma: null,
          board: this.state.board
        });
        return;
    }
  };

  onNariConfirmClicked = (toNaru: boolean) => {
    const holdingKoma = this.getHoldingKoma();
    if (holdingKoma === null) {
      throw new Error("unexpected state");
    }
    if (toNaru) {
      holdingKoma.naru();
    }
    this.setState({
      teme: this.state.teme + 1,
      holdingKoma: null,
      nariConfirmShown: false
    });
  };

  /**
   * Read methods
   */
  isSenteban = () => {
    return this.state.teme % 2 === 1;
  };

  isGoteban = () => {
    return !this.isSenteban();
  };

  isNariConfirmShown = () => {
    return this.state.nariConfirmShown;
  };

  getHoldingKoma = () => {
    return this.state.holdingKoma;
  };

  calcKiki = () => {
    return this.state.board.calcKiki();
  };

  getSenteMochigomas = () => {
    return this.state.board.getSenteMochigomas();
  };

  getGoteMochigomas = () => {
    return this.state.board.getGoteMochigomas();
  };

  getKoma = (coord: Coordinate) => {
    return this.state.board.getKoma(coord);
  }
}
