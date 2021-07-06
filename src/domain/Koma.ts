import range from "lodash/range";
import { BOARD_SIDE } from "../constants";
import { Coordinate } from "../types";

type ColDiff = number & { readonly neverUsed?: unique symbol };
type RowDiff = number & { readonly neverUsed?: unique symbol };

type Movement = [ColDiff, RowDiff];
type ConsequentMovements = Movement[]; // 飛車角香車のような遠い駒の利きがある駒は複数要素存在・そうでない駒は単一

type KomaDef = {
  characters: [string] | [string, string];
  movements: ConsequentMovements[];
  nariMovements: ConsequentMovements[];
};

export const createKoma = (komaDef: KomaDef, isSente: boolean) => {};

export const KIN: KomaDef = {
  characters: ["金"],
  movements: [[[0, -1]], [[-1, -1]], [[1, -1]], [[-1, 0]], [[1, 0]], [[0, 1]]],
  nariMovements: []
};
export const FU: KomaDef = {
  characters: ["歩", "と"],
  movements: [[[0, -1]]],
  nariMovements: KIN.movements
};
export const KYOSHA: KomaDef = {
  characters: ["香", "杏"],
  movements: [range(1, BOARD_SIDE).map(delta => [0, -delta])],
  nariMovements: KIN.movements
};
export const KEMA: KomaDef = {
  characters: ["桂", "圭"],
  movements: [[[-1, -2]], [[1, -2]]],
  nariMovements: KIN.movements
};
export const GIN: KomaDef = {
  characters: ["銀", "全"],
  movements: [[[0, -1]], [[-1, -1]], [[1, -1]], [[-1, 1]], [[1, 1]]],
  nariMovements: KIN.movements
};
const KAKU_MOVEMENTS = [range(1, BOARD_SIDE)
  .map(delta => [-delta, -delta] as [ColDiff, RowDiff])]
  .concat(
    [range(1, BOARD_SIDE).map(delta => [delta, -delta])],
    [range(1, BOARD_SIDE).map(delta => [-delta, delta])],
    [range(1, BOARD_SIDE).map(delta => [delta, delta])]
  );
export const KAKU: KomaDef = {
  characters: ["角", "馬"],
  movements: KAKU_MOVEMENTS,
  nariMovements: KAKU_MOVEMENTS.concat([[[0, -1]]], [[[1, 0]]], [[[0, 1]]], [[[-1, 0]]]),
};
const HISHA_MOVEMENTS = [range(1, BOARD_SIDE)
  .map(delta => [0, -delta] as [ColDiff, RowDiff])]
  .concat(
    [range(1, BOARD_SIDE).map(delta => [delta, 0])],
    [range(1, BOARD_SIDE).map(delta => [0, delta])],
    [range(1, BOARD_SIDE).map(delta => [-delta, 0])],
  );
export const HISHA: KomaDef = {
  characters: ["飛", "竜"],
  movements: HISHA_MOVEMENTS,
  nariMovements: HISHA_MOVEMENTS.concat([[[-1, -1]]], [[[1, -1]]], [[[1, 1]]], [[[-1, 1]]])
};
export const GYOKU: KomaDef = {
  characters: ["玉"],
  movements: [
    [[0, -1]],
    [[1, -1]],
    [[1, 0]],
    [[1, 1]],
    [[0, 1]],
    [[-1, 1]],
    [[-1, 0]],
    [[-1, -1]],
  ],
  nariMovements: []
};

export default class Koma {
  private static id: number = 0;

  readonly id: number;
  private nari: boolean;
  constructor(private readonly koma: KomaDef, private sente: boolean, nari: boolean = false) {
    this.id = Koma.id;
    this.nari = nari;
    Koma.id++;
  }

  getCharacter(): string {
    return this.koma.characters.length === 1
      ? this.koma.characters[0]
      : this.koma.characters[this.nari ? 1 : 0];
  }

  getMovements(): ConsequentMovements[] {
    const movements = this.nari ? this.koma.nariMovements : this.koma.movements;
    return this.sente
      ? movements
      : movements.map(
        (consMoves) => consMoves.map(([colDiff, rowDiff]) => [-colDiff, -rowDiff])
      );
  }

  isSente(): boolean {
    return this.sente;
  }

  isGote(): boolean {
    return !this.isSente();
  }

  isNari(): boolean {
    return this.nari;
  }

  naru(): void {
    this.nari = true;
  }

  taken():void {
    this.sente = !this.sente;
    this.nari = false;
  }

}

export const HIRATE: [Coordinate, Koma][] = [
  [[5, 9], new Koma(GYOKU, true)],
  [[4, 9], new Koma(KIN, true)],
  [[6, 9], new Koma(KIN, true)],
  [[3, 9], new Koma(GIN, true)],
  [[7, 9], new Koma(GIN, true)],
  [[2, 9], new Koma(KEMA, true)],
  [[8, 9], new Koma(KEMA, true)],
  [[1, 9], new Koma(KYOSHA, true)],
  [[9, 9], new Koma(KYOSHA, true)],
  [[2, 8], new Koma(HISHA, true)],
  [[8, 8], new Koma(KAKU, true)],
  [[1, 7], new Koma(FU, true)],
  [[2, 7], new Koma(FU, true)],
  [[3, 7], new Koma(FU, true)],
  [[4, 7], new Koma(FU, true)],
  [[5, 7], new Koma(FU, true)],
  [[6, 7], new Koma(FU, true)],
  [[7, 7], new Koma(FU, true)],
  [[8, 7], new Koma(FU, true)],
  [[9, 7], new Koma(FU, true)],
  [[5, 1], new Koma(GYOKU, false)],
  [[4, 1], new Koma(KIN, false)],
  [[6, 1], new Koma(KIN, false)],
  [[3, 1], new Koma(GIN, false)],
  [[7, 1], new Koma(GIN, false)],
  [[2, 1], new Koma(KEMA, false)],
  [[8, 1], new Koma(KEMA, false)],
  [[1, 1], new Koma(KYOSHA, false)],
  [[9, 1], new Koma(KYOSHA, false)],
  [[2, 2], new Koma(KAKU, false)],
  [[8, 2], new Koma(HISHA, false)],
  [[1, 3], new Koma(FU, false)],
  [[2, 3], new Koma(FU, false)],
  [[3, 3], new Koma(FU, false)],
  [[4, 3], new Koma(FU, false)],
  [[5, 3], new Koma(FU, false)],
  [[6, 3], new Koma(FU, false)],
  [[7, 3], new Koma(FU, false)],
  [[8, 3], new Koma(FU, false)],
  [[9, 3], new Koma(FU, false)],
];
