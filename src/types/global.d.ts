// Global type declarations for missing libraries

// Node.js Buffer type for browser compatibility
declare global {
  interface Buffer extends Uint8Array {
    write(
      string: string,
      offset?: number,
      length?: number,
      encoding?: string
    ): number;
    toString(encoding?: string, start?: number, end?: number): string;
    toJSON(): { type: "Buffer"; data: number[] };
    equals(otherBuffer: Buffer): boolean;
    compare(
      otherBuffer: Buffer,
      targetStart?: number,
      targetEnd?: number,
      sourceStart?: number,
      sourceEnd?: number
    ): number;
    copy(
      targetBuffer: Buffer,
      targetStart?: number,
      sourceStart?: number,
      sourceEnd?: number
    ): number;
    slice(start?: number, end?: number): Buffer;
    subarray(start?: number, end?: number): Buffer;
    writeUIntLE(value: number, offset: number, byteLength: number): number;
    writeUIntBE(value: number, offset: number, byteLength: number): number;
    writeIntLE(value: number, offset: number, byteLength: number): number;
    writeIntBE(value: number, offset: number, byteLength: number): number;
    readUIntLE(offset: number, byteLength: number): number;
    readUIntBE(offset: number, byteLength: number): number;
    readIntLE(offset: number, byteLength: number): number;
    readIntBE(offset: number, byteLength: number): number;
    readUInt8(offset: number): number;
    readUInt16LE(offset: number): number;
    readUInt16BE(offset: number): number;
    readUInt32LE(offset: number): number;
    readUInt32BE(offset: number): number;
    readInt8(offset: number): number;
    readInt16LE(offset: number): number;
    readInt16BE(offset: number): number;
    readInt32LE(offset: number): number;
    readInt32BE(offset: number): number;
    readFloatLE(offset: number): number;
    readFloatBE(offset: number): number;
    readDoubleLE(offset: number): number;
    readDoubleBE(offset: number): number;
    reverse(): this;
    swap16(): Buffer;
    swap32(): Buffer;
    swap64(): Buffer;
    writeUInt8(value: number, offset: number): number;
    writeUInt16LE(value: number, offset: number): number;
    writeUInt16BE(value: number, offset: number): number;
    writeUInt32LE(value: number, offset: number): number;
    writeUInt32BE(value: number, offset: number): number;
    writeInt8(value: number, offset: number): number;
    writeInt16LE(value: number, offset: number): number;
    writeInt16BE(value: number, offset: number): number;
    writeInt32LE(value: number, offset: number): number;
    writeInt32BE(value: number, offset: number): number;
    writeFloatLE(value: number, offset: number): number;
    writeFloatBE(value: number, offset: number): number;
    writeDoubleLE(value: number, offset: number): number;
    writeDoubleBE(value: number, offset: number): number;
    fill(value: any, offset?: number, end?: number): this;
    indexOf(
      value: string | number | Buffer,
      byteOffset?: number,
      encoding?: string
    ): number;
    lastIndexOf(
      value: string | number | Buffer,
      byteOffset?: number,
      encoding?: string
    ): number;
    includes(
      value: string | number | Buffer,
      byteOffset?: number,
      encoding?: string
    ): boolean;
  }

  var Buffer: {
    new (str: string, encoding?: string): Buffer;
    new (size: number): Buffer;
    new (array: Uint8Array): Buffer;
    new (arrayBuffer: ArrayBuffer | SharedArrayBuffer): Buffer;
    new (array: any[]): Buffer;
    new (buffer: Buffer): Buffer;
    alloc(
      size: number,
      fill?: string | Buffer | number,
      encoding?: string
    ): Buffer;
    allocUnsafe(size: number): Buffer;
    allocUnsafeSlow(size: number): Buffer;
    isBuffer(obj: any): obj is Buffer;
    byteLength(
      string: string | ArrayBuffer | SharedArrayBuffer | Buffer | Uint8Array,
      encoding?: string
    ): number;
    concat(list: Buffer[], totalLength?: number): Buffer;
    compare(buf1: Buffer, buf2: Buffer): number;
  };
}

declare module "d3-cloud" {
  export interface CloudLayout {
    size: (size: [number, number]) => CloudLayout;
    words: (
      words: Array<{ text: string; size: number; [key: string]: unknown }>
    ) => CloudLayout;
    padding: (padding: number) => CloudLayout;
    rotate: (rotate: () => number) => CloudLayout;
    font: (font: string) => CloudLayout;
    fontSize: (fontSize: () => number) => CloudLayout;
    on: (event: string, callback: () => void) => CloudLayout;
    start: () => void;
  }

  export function cloud(): CloudLayout;
}

declare module "sinonjs_fake-timers" {
  export interface FakeTimers {
    install: (config?: { now?: number | Date; toFake?: string[] }) => void;
    uninstall: () => void;
    tick: (ms: number) => void;
    next: () => void;
    runAll: () => void;
    runToLast: () => void;
    reset: () => void;
    setSystemTime: (now?: number | Date) => void;
    getRealSystemTime: () => number;
  }

  export function createClock(
    now?: number | Date,
    loopLimit?: number
  ): FakeTimers;
  export function install(config?: {
    now?: number | Date;
    toFake?: string[];
  }): FakeTimers;
}

declare module "sizzle" {
  export function select(
    selector: string,
    context?: Element | Document
  ): Element[];
  export function selectAll(
    selector: string,
    context?: Element | Document
  ): Element[];
}

declare module "yauzl" {
  export interface ZipFile {
    readEntry(): void;
    on(event: string, callback: (entry: Entry) => void): void;
    close(): void;
  }

  export interface Entry {
    fileName: string;
    uncompressedSize: number;
    compressedSize: number;
    isDirectory: boolean;
    isFile: boolean;
  }

  export function fromBuffer(
    // eslint-disable-next-line no-undef
    buffer: Buffer,
    callback: (err: Error | null, zipfile: ZipFile) => void
  ): void;
  export function fromFd(
    fd: number,
    callback: (err: Error | null, zipfile: ZipFile) => void
  ): void;
  export function fromRandomAccessReader(
    reader: {
      read: (
        offset: number,
        length: number,
        // eslint-disable-next-line no-undef
        callback: (err: Error | null, buffer: Buffer) => void
      ) => void;
      close: () => void;
    },
    totalSize: number,
    callback: (err: Error | null, zipfile: ZipFile) => void
  ): void;
}

// Declare missing D3 modules
declare module "d3-color" {
  export function rgb(
    r: number,
    g: number,
    b: number
  ): { r: number; g: number; b: number; toString(): string };
  export function hsl(
    h: number,
    s: number,
    l: number
  ): { h: number; s: number; l: number; toString(): string };
  export function lab(
    l: number,
    a: number,
    b: number
  ): { l: number; a: number; b: number; toString(): string };
  export function hcl(
    h: number,
    c: number,
    l: number
  ): { h: number; c: number; l: number; toString(): string };
  export function cubehelix(
    h: number,
    s: number,
    l: number
  ): { h: number; s: number; l: number; toString(): string };
}

declare module "d3-delaunay" {
  export function delaunay(points: [number, number][]): {
    triangles: [number, number, number][];
    points: [number, number][];
  };
  export function voronoi(points: [number, number][]): {
    polygons: [number, number][][];
    triangles: [number, number, number][];
    edges: [number, number][];
  };
}

declare module "d3-interpolate" {
  export function interpolate<T>(a: T, b: T): (t: number) => T;
  export function interpolateNumber(
    a: number,
    b: number
  ): (t: number) => number;
  export function interpolateString(
    a: string,
    b: string
  ): (t: number) => string;
  export function interpolateRgb(a: string, b: string): (t: number) => string;
  export function interpolateHsl(a: string, b: string): (t: number) => string;
}

declare module "d3-path" {
  export function path(): {
    moveTo: (x: number, y: number) => void;
    lineTo: (x: number, y: number) => void;
    closePath: () => void;
    toString: () => string;
  };
}

declare module "d3-scale-chromatic" {
  export function interpolateViridis(t: number): string;
  export function interpolateInferno(t: number): string;
  export function interpolateMagma(t: number): string;
  export function interpolatePlasma(t: number): string;
  export function interpolateWarm(t: number): string;
  export function interpolateCool(t: number): string;
  export function interpolateRainbow(t: number): string;
  export function interpolateSinebow(t: number): string;
}

declare module "d3-time" {
  export function timeInterval(
    floor: (date: Date) => Date,
    offset: (date: Date, step: number) => Date,
    count: (start: Date, stop: Date) => number,
    field: (date: Date) => number
  ): {
    floor: (date: Date) => Date;
    ceil: (date: Date) => Date;
    offset: (date: Date, step: number) => Date;
    range: (start: Date, stop: Date, step?: number) => Date[];
  };
  export function timeMillisecond(): {
    floor: (date: Date) => Date;
    ceil: (date: Date) => Date;
    offset: (date: Date, step: number) => Date;
    range: (start: Date, stop: Date, step?: number) => Date[];
  };
  export function timeSecond(): {
    floor: (date: Date) => Date;
    ceil: (date: Date) => Date;
    offset: (date: Date, step: number) => Date;
    range: (start: Date, stop: Date, step?: number) => Date[];
  };
  export function timeMinute(): {
    floor: (date: Date) => Date;
    ceil: (date: Date) => Date;
    offset: (date: Date, step: number) => Date;
    range: (start: Date, stop: Date, step?: number) => Date[];
  };
  export function timeHour(): {
    floor: (date: Date) => Date;
    ceil: (date: Date) => Date;
    offset: (date: Date, step: number) => Date;
    range: (start: Date, stop: Date, step?: number) => Date[];
  };
  export function timeDay(): {
    floor: (date: Date) => Date;
    ceil: (date: Date) => Date;
    offset: (date: Date, step: number) => Date;
    range: (start: Date, stop: Date, step?: number) => Date[];
  };
  export function timeWeek(): {
    floor: (date: Date) => Date;
    ceil: (date: Date) => Date;
    offset: (date: Date, step: number) => Date;
    range: (start: Date, stop: Date, step?: number) => Date[];
  };
  export function timeMonth(): {
    floor: (date: Date) => Date;
    ceil: (date: Date) => Date;
    offset: (date: Date, step: number) => Date;
    range: (start: Date, stop: Date, step?: number) => Date[];
  };
  export function timeYear(): {
    floor: (date: Date) => Date;
    ceil: (date: Date) => Date;
    offset: (date: Date, step: number) => Date;
    range: (start: Date, stop: Date, step?: number) => Date[];
  };
}

declare module "d3-time-format" {
  export function timeFormat(specifier: string): (date: Date) => string;
  export function timeParse(specifier: string): (date: string) => Date | null;
  export function utcFormat(specifier: string): (date: Date) => string;
  export function utcParse(specifier: string): (date: string) => Date | null;
}
