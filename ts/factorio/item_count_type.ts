import { z } from 'zod';

import { Uint32 } from '#root/ts/factorio/uint32';

export const ItemCountType = Uint32;
export type ItemCountType = z.TypeOf<typeof ItemCountType>;
