import { extent, range } from 'd3-array';
import { scaleLinear, scaleQuantize } from 'd3-scale';

import { zip } from '#root/ts/iter';
import {
	domainScaleFitContain,
	quantizedMerge,
	quantizeLine,
	unrolledSpace2D,
} from '#root/ts/math/space/space';

function head<T, F>(
	t: Iterator<T>,
	n: number,
	f: F
): [value: (T | F)[], eof: boolean, eofAt?: number] {
	const o: (T | F)[] = [];
	let eof = false;
	let eofAt: undefined | number;

	for (let i = 0; i < n; i++) {
		const v = t.next();
		if (v.done && !eof) {
			eof = v.done;
			eofAt = i;
		}
		o.push(v.done ? f : v.value);
	}

	return [o, eof, eofAt];
}

function* subdivideG<T, F>(
	cells: Iterable<T>,
	width: number,
	newCellWidth: number,
	newCellHeight: number,
	f: F
): Iterable<(T | F)[]> {
	const it = cells[Symbol.iterator]();

	const chunkSize = newCellHeight * width;
	const cellsPerChunk = Math.ceil(width / newCellWidth);
	const oldCellsInNewCell = newCellWidth * newCellHeight;
	const wc = newCellWidth;
	const w = width;

	for (;;) {
		const [chunk, eof, eofAt] = head(it, chunkSize, f);

		if (eof && eofAt == 0) break;

		for (let ic = 0; ic < cellsPerChunk; ic++) {
			const newCell: (T | F)[] = [];

			for (let nc = 0; nc < oldCellsInNewCell; nc++) {
				// if the chunk size does not divide evenly into w,
				// we can attempt to get a value that is out of the bounds
				// of our input.
				//
				// to prevent garbage results, we check if we're reading oob here.

				const y = (nc - (nc % wc)) / wc;
				if (y >= newCellHeight) {
					newCell[nc] = f;
					continue;
				}

				const x = ic * wc + (nc % wc);

				if (x >= w) {
					newCell[nc] = f;
					continue;
				}

				newCell[nc] =
					chunk[ic * wc + (nc % wc) + w * ((nc - (nc % wc)) / wc)]!;
			}

			yield newCell;
		}

		if (eof) break;
	}
}

export function subdivide<T, F>(
	cells: Iterable<T>,
	width: number,
	newCellWidth: number,
	newCellHeight: number,
	f: F
): [cells: Iterable<(T | F)[]>, width: number] {
	return [
		subdivideG(cells, width, newCellWidth, newCellHeight, f),
		Math.ceil(width / newCellWidth),
	];
}

function eights(
	cells: Iterable<1 | 0>,
	width: number
): [cells: Iterable<(1 | 0)[]>, width: number] {
	return subdivide(cells, width, 2, 4, 0 as const);
}

/**
 * Encodes a single braille codepoint, in unicode-canonical order (which is kind of weird).
 * It's this order:
 * ```
 *    1 4
 *    2 5
 *    3 6
 *    7 8
 * ```
 */
function encodeBrailleCanon(
	a: 1 | 0 = 0,
	b: 1 | 0 = 0,
	c: 1 | 0 = 0,
	d: 1 | 0 = 0,
	e: 1 | 0 = 0,
	f: 1 | 0 = 0,
	g: 1 | 0 = 0,
	h: 1 | 0 = 0
): number {
	return (
		0x2800 +
		((a << 0) |
			(b << 1) |
			(c << 2) |
			(d << 3) |
			(e << 4) |
			(f << 5) |
			(g << 6) |
			(h << 7))
	);
}

/**
 * encodes braille codepoint in a more reasonable canonical order:
 * ```
 *    1 2
 *    3 4
 *    5 6
 *    7 8
 * ```
 */
function encodeBraille(
	a: 1 | 0 = 0,
	b: 1 | 0 = 0,
	c: 1 | 0 = 0,
	d: 1 | 0 = 0,
	e: 1 | 0 = 0,
	f: 1 | 0 = 0,
	g: 1 | 0 = 0,
	h: 1 | 0 = 0
): number {
	return encodeBrailleCanon(a, c, e, b, d, f, g, h);
}

function* join<T, V>(it: Iterable<Iterable<T>>, by: V): Iterable<V | T> {
	let k = 0;
	for (const i of it) {
		if (k !== 0) yield by;
		yield* i;
		k++;
	}
}

function* split<T>(it: Iterable<T>, count: number): Iterable<Iterable<T>> {
	let acc: T[] = [];
	let i = 0;
	for (const v of it) {
		if (i > 0 && i % count == 0) {
			yield acc;
			acc = [];
		}
		acc.push(v);
		i++;
	}

	if (acc.length > 0) yield acc;
}

function* map<I, O>(it: Iterable<I>, f: (v: I) => O) {
	for (const v of it) yield f(v);
}

const nl = '\n'.charCodeAt(0);

/**
 * Encode a coordinate space as some braille characters
 */
export function plot(v: Iterable<1 | 0>, width: number): string {
	const [it, n] = eights(v, width);

	const braille = map(it, ([a, b, c, d, e, f, g, h]) =>
		encodeBraille(a, b, c, d, e, f, g, h)
	);
	const blocks = split(braille, n);

	const charCodes = join(blocks, nl);

	return String.fromCharCode(...charCodes);
}

/**
 * Plot a 2D space as braille characters.
 *
 * If height is not specified, it will be scaled the same way as width.
 */
export function plot2D<T>(
	v: Iterable<T>,
	x: (v: T) => number,
	y: (v: T) => number,
	width: number
): string {
	const all = [...v];

	const xExtent = extent(all, x);
	const yExtent = extent(all, y);
	const [, yMax] = yExtent;

	const unifiedDomain = domainScaleFitContain(
		[xExtent, yExtent],
		([min]) => min!,
		([, max]) => max!
	);

	// here we get the y range by seeing what it would be on a linear
	// scale and rounding up.
	const height = Math.ceil(scaleLinear(unifiedDomain, [0, width])(yMax!));

	const scale = scaleQuantize(
		unifiedDomain,
		range(0, Math.max(width, height))
	);

	// unroll into an array of 1s and 0s

	const [index, length] = unrolledSpace2D(width);

	const unrolledSpace: Array<1 | 0> = Array(length(height)).fill(0);

	for (const item of all) {
		unrolledSpace[index(scale(x(item)), scale(y(item)))] = 1;
	}

	return plot(unrolledSpace, width);
}

/**
 * Plot a 2D space as braille characters.
 *
 * If height is not specified, it will be scaled the same way as width.
 */
export function plotLines2D<T>(
	v: Iterable<T>,
	line: (v: T) => [[x: number, y: number], [x: number, y: number]],
	width: number
): string {
	const all = [...v];
	const x = (v: T) => line(v).map(v => v[0]);
	const y = (v: T) => line(v).map(v => v[1]);
	const xValues = all.map(v => x(v)).flat(1);
	const yValues = all.map(v => y(v)).flat(1);

	const xExtent = extent(xValues, x => x);
	const yExtent = extent(yValues, y => y);
	console.log('xExtent', xExtent, 'yExtent', yExtent);
	let [, yMax] = yExtent;
	if (yMax == 0) yMax = 1;

	const unifiedDomain = domainScaleFitContain(
		[xExtent, yExtent],
		([min]) => min!,
		([, max]) => max!
	);

	// here we get the y range by seeing what it would be on a linear
	// scale and rounding up.
	const height = Math.ceil(scaleLinear(unifiedDomain, [0, width])(yMax!));

	const scale = scaleQuantize(
		unifiedDomain,
		range(0, Math.max(width, height))
	);

	// i fucked this up but im not sure how yet
	// oh. i need to do some kind of ordered permute over this list
	// so i visit every [x,y] combination
	//
	// this didnt work and im kind of bewildered how i thought it would
	// implement wu's algorithm https://en.wikipedia.org/wiki/Xiaolin_Wu%27s_line_algorithm
	const [xMaskIter, yMaskIter ] =
			all.reduce<
				[Iterable<1 | 0> | undefined, Iterable<1 | 0> | undefined]
			>(
				([xlq, ylq], c) => {
					const [[x1, y1], [x2, y2]] = line(c);
					const xQuantize = quantizeLine(x1, x2, scale);
					const yQuantize = quantizeLine(y1, y2, scale);

					return [
						xlq === undefined
							? xQuantize
							: quantizedMerge(xlq, xQuantize),
						ylq === undefined
							? yQuantize
							: quantizedMerge(ylq, yQuantize),
					];
				},
				[undefined, undefined]
			) as [Iterable<1 | 0>, Iterable<1 | 0>]

	const [xMask, yMask] = [[...xMaskIter], [...yMaskIter]];


	const [index, length] = unrolledSpace2D(width);

	const unrolledSpace: Array<1 | 0> = Array(length(height)).fill(0);

	for (let i = 0; i < unrolledSpace.length; i++) {
		const x = i % width;
		const y = Math.floor(i/  width);
		unrolledSpace[i] = (xMask[x]! & yMask[y]!) as 0|1
	}

	return plot(unrolledSpace, width);
}
