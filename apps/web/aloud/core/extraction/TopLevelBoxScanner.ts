import { ChunkedFileReader } from "./ChunkedFileReader";

export interface BoxHeader {
    type: string;
    start: number;
    size: number;
    payloadStart: number;
    headerSize: number;
}

export interface ScanResult {
  ftyp: { buffer: ArrayBuffer; start: number } | null;
  moov: { buffer: ArrayBuffer; start: number };
  boxesSeen: BoxHeader[];
  fileSize: number;
}

export const MAX_TOP_LEVEL_BOXES_TO_SCAN = 100_000; // guard against corrupt/malicious loops
export const BOX_HEADER_PROBE_SIZE = 16; // covers 32-bit + optional 64-bit largesize


async function readSlice(file: File, start: number, end: number): Promise<ArrayBuffer> {
    return file.slice(start, end).arrayBuffer();
}

export class TopLevelBoxScanner {
    private readonly readSlice: ChunkedFileReader;

    constructor(private readonly file: File) {
        this.readSlice = new ChunkedFileReader(this.file, 8)
    }

    async scan(): Promise<ScanResult> {
        let offset = 0;
        let ftyp: ScanResult['ftyp'] = null;
        let moov: ScanResult['moov'] | null = null;
        const boxesSeen: BoxHeader[] = [];
        const fileSize = this.file.size;


        for(let i = 0; i < MAX_TOP_LEVEL_BOXES_TO_SCAN && offset < fileSize; i++) {
            const probeEnd = Math.min(offset + BOX_HEADER_PROBE_SIZE, fileSize);
            // const probeBuffer = await readSlice(this.file, offset, probeEnd);
            const probeBuffer = await readSlice(this.file, offset, probeEnd);
            if (probeBuffer.byteLength < 8) break; // trailing garbage shorter than any valid header

            let header: BoxHeader;
            try {
                header = this.#parseBoxHeader(probeBuffer, offset);
            } catch (err) {
                throw new UnsupportedContainerError(`could not parse box header at offset ${offset}`);
            }

            const effectiveSize = header.size === 0 ? fileSize - offset : header.size;
            if (effectiveSize <= 0 || offset + effectiveSize > fileSize + header.headerSize) {
                throw new UnsupportedContainerError(`box '${header.type}' at ${offset} reports an invalid size`);
            }

            console.log("header", header) //TODO: hare e console log remove leater
            boxesSeen.push(header);

            if (header.type === "ftyp") {
                ftyp = {
                    buffer: await readSlice(this.file, header.start, header.start + effectiveSize),
                    start: header.start 
                };
            } else if (header.type === "moov") {
                moov = {
                    buffer: await readSlice(this.file, header.start, header.start + effectiveSize), 
                    start: header.start 
                };
                break; // this is all Phase 1 needs — stop scanning immediately
            }

            offset = header.start + effectiveSize;
        }

        if (!moov) {
            throw new MoovNotFoundError(boxesSeen.length, offset);
        }

        return { ftyp, moov, boxesSeen, fileSize };

    }

    #parseBoxHeader(buffer: ArrayBuffer, start: number): BoxHeader {
        const view = new DataView(buffer);
        if (buffer.byteLength < 8) {
            throw new Error(`Buffer too small to contain a box header at offset ${start}`);
        }

        const size32 = view.getUint32(0, false);
        const type = String.fromCharCode(view.getUint8(4), view.getUint8(5), view.getUint8(6), view.getUint8(7));

        if (size32 === 1) {
            // 64-bit largesize follows immediately after the 4-char type.
            if (buffer.byteLength < 16) {
                throw new Error(`Buffer too small for largesize box header at offset ${start}`);
            }
            const hi = view.getUint32(8, false);
            const lo = view.getUint32(12, false);
            const size = hi * 2 ** 32 + lo; // safe up to 2^53, plenty for our 20GB ceiling
            return { type, start, size, payloadStart: start + 16, headerSize: 16 };
        }

        if (size32 === 0) {
            // Box extends to EOF — caller must resolve using total file size.
            return { type, start, size: 0, payloadStart: start + 8, headerSize: 8 };
        }

        return { type, start, size: size32, payloadStart: start + 8, headerSize: 8 };
    }

}