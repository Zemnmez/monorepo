import { z } from 'zod';

import { InfinityFilter } from '#root/ts/factorio/infinity_filter';

export const InfinitySettings = z.strictObject({
	remove_unfiltered_items: z.boolean().optional(),
	filters: z.array(InfinityFilter),
});

export type InfinitySettings = z.TypeOf<typeof InfinitySettings>;
