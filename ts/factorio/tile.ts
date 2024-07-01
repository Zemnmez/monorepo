import { z } from 'zod';

import { Position } from '#root/ts/factorio/position';

export const Tile = z.strictObject({
	/**
	 * Prototype name of the tile (e.g. "concrete")
	 */
	name: z.string(),
	position: Position,
});

export type Tile = z.TypeOf<typeof Tile>;
