
export const params = {
  scale: 2,
  fixedWidth: 296,
  shouldTrimWhiteBorderWidth: 5 * 2,
  strokeWidth: 7,
  textMaxLength: 15, // e.g. 什么时候禁止男的发这种表情包
  fontConfig: {
    defalutSize: 40,
    minSize: 25,
    reduceUnit: 5,
    lineHeight: 0.88,
  },
  edgeDetect: {
    offLength: -8,
    tryMoveDistance: 10,
    veryEdgeLimit: 15,
    twoLineAutoMoveLength: 2
  },
} as const

export type Params = typeof params

enum ECharacter {
  airi = 'airi',
  akito = 'akito',
  an = 'an',
  emu = 'emu',
  ena = 'ena',
  Haruka = 'Haruka',
  Honami = 'Honami',
  Ichika = 'Ichika',
  KAITO = 'KAITO',
  Kanade = 'Kanade',
  Kohane = 'Kohane',
  Len = 'Len',
  Luka = 'Luka',
  Mafuyu = 'Mafuyu',
  Meiko = 'Meiko',
  Miku = 'Miku',
  Minori = 'Minori',
  Mizuki = 'Mizuki',
  Nene = 'Nene',
  Rin = 'Rin',
  Rui = 'Rui',
  Saki = 'Saki',
  Shiho = 'Shiho',
  Shizuku = 'Shizuku',
  Touya = 'Touya',
  Tsukasa = 'Tsukasa',
}

enum EColor {
  airi = '#FB8AAC',
  akito = '#FF7722',
  an = '#00BADC',
  emu = '#FF66BB',
  ena = '#B18F6C',
  Haruka = '#6495F0',
  Honami = '#F86666',
  Ichika = '#33AAEE',
  KAITO = '#3366CC',
  Kanade = '#BB6688',
  Kohane = '#FF6699',
  Len = '#D3BD00',
  Luka = '#F88CA7',
  Mafuyu = '#7171AF',
  Meiko = '#E4485F',
  Miku = '#33CCBB',
  Minori = '#F39E7D',
  Mizuki = '#CA8DB6',
  Nene = '#19CD94',
  Rin = '#E8A505',
  Rui = '#BB88EE',
  Saki = '#F5B303',
  Shiho = '#A0C10B',
  Shizuku = '#5CD0B9',
  Touya = '#0077DD',
  Tsukasa = '#F09A04',
}

type Ext = 'png' | 'jpg'
type UpperFirstCase<T> = T extends `${infer First}${infer Rest}`
  ? `${Uppercase<First>}${Rest}`
  : T
type Name = UpperFirstCase<ECharacter> | ECharacter
type DirPath = `${ECharacter}/${Name}_${number}.${Ext}`

export enum EPreset {
  /**
   * top
   */
  normal = 'normal',
  /**
   * left rotate
   */
  left = 'left',
  /**
   * right rotate
   */
  right = 'right',
  /**
   * most top
   */
  mostTop = 'mostTop',
  /**
   * mostTop + left rotate
   */
  mostTopLeft = 'mostTopLeft',
  /**
   * mostTop + right rotate
   */
  mostTopRight = 'mostTopRight',
}

interface IPosition {
  /**
   * x position weight
   */
  x: number
  /**
   * y position weight
   */
  y: number
  /**
   * width weight
   */
  w: number
  /**
   * rotate angle
   * @default 0
   */
  r?: number
  /**
   * initial font size
   * @default {fontSize.defaultSize}
   */
  s?: number
}

interface IConfigBase {
  params?: Params
}

export interface IConfig extends IConfigBase {
  color: EColor
  preset?: EPreset
  pos?: IPosition
}
type IConfigs = Record<ECharacter, IConfig>

export type IConfigSpecified = Required<Pick<IConfig, 'color' | 'pos'>> & IConfigBase

export const configs: IConfigs = {
  [ECharacter.airi]: { color: EColor.airi },
  [ECharacter.akito]: { color: EColor.akito },
  [ECharacter.an]: { color: EColor.an },
  [ECharacter.emu]: { color: EColor.emu },
  [ECharacter.ena]: { color: EColor.ena },
  [ECharacter.Haruka]: { color: EColor.Haruka },
  [ECharacter.Honami]: { color: EColor.Honami },
  [ECharacter.Ichika]: { color: EColor.Ichika },
  [ECharacter.KAITO]: { color: EColor.KAITO },
  [ECharacter.Kanade]: { color: EColor.Kanade },
  [ECharacter.Kohane]: { color: EColor.Kohane },
  [ECharacter.Len]: { color: EColor.Len },
  [ECharacter.Luka]: { color: EColor.Luka },
  [ECharacter.Mafuyu]: { color: EColor.Mafuyu },
  [ECharacter.Meiko]: { color: EColor.Meiko },
  [ECharacter.Miku]: { color: EColor.Miku },
  [ECharacter.Minori]: { color: EColor.Minori },
  [ECharacter.Mizuki]: { color: EColor.Mizuki },
  [ECharacter.Nene]: { color: EColor.Nene },
  [ECharacter.Rin]: { color: EColor.Rin },
  [ECharacter.Rui]: { color: EColor.Rui },
  [ECharacter.Saki]: { color: EColor.Saki },
  [ECharacter.Shiho]: { color: EColor.Shiho },
  [ECharacter.Shizuku]: { color: EColor.Shizuku },
  [ECharacter.Touya]: { color: EColor.Touya },
  [ECharacter.Tsukasa]: { color: EColor.Tsukasa },
}

export const presets: Record<EPreset, IPosition> = {
  [EPreset.normal]: {
    x: 0.5,
    y: 0.25,
    w: 0.8,
    r: 0,
  },
  [EPreset.right]: {
    x: 0.6,
    y: 0.25,
    w: 0.8,
    r: 10,
  },
  [EPreset.left]: {
    x: 0.4,
    y: 0.25,
    w: 0.8,
    r: -10,
  },
  [EPreset.mostTop]: {
    x: 0.5,
    y: 0.16,
    w: 0.8,
    r: 0,
  },
  [EPreset.mostTopLeft]: {
    x: 0.4,
    y: 0.16,
    w: 0.8,
    r: -10,
  },
  [EPreset.mostTopRight]: {
    x: 0.6,
    y: 0.16,
    w: 0.8,
    r: 10,
  },
}

export const characterSpecifiedConfig: Record<DirPath, IConfigSpecified> = {
  // ena
  'ena/Ena_01.png': {
    pos: presets[EPreset.right],
    color: EColor.ena,
  },
  // Mizuki
  'Mizuki/Mizuki_13.png': {
    pos: presets[EPreset.right],
    color: EColor.Mizuki,
  },
  'Mizuki/Mizuki_14.png': {
    pos: presets[EPreset.left],
    color: EColor.Mizuki,
  },
  'Mizuki/Mizuki_16.png': {
    pos: presets[EPreset.mostTopLeft],
    color: EColor.Mizuki,
  },
  'Mizuki/Mizuki_17.png': {
    pos: presets[EPreset.left],
    color: EColor.Mizuki,
  },
  // Airi
  'airi/Airi_11.png': {
    pos: presets[EPreset.left],
    color: EColor.airi,
  },
  // Nene
  'Nene/Nene_14.png': {
    pos: {
      ...presets[EPreset.left],
      s: 32
    },
    color: EColor.Nene,
  },
  // Honami
  'Honami/Honami_16.png': {
    pos: presets[EPreset.left],
    color: EColor.Honami,
  },
  // Mafuyu
  'Mafuyu/Mafuyu_14.png': {
    pos: presets[EPreset.left],
    color: EColor.Mafuyu,
  },
  'Mafuyu/Mafuyu_08.png': {
    pos: presets[EPreset.left],
    color: EColor.Mafuyu,
  },
  // Emu
  'emu/Emu_07.png': {
    pos: presets[EPreset.left],
    color: EColor.emu,
  },
}
