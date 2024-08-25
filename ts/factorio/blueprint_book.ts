import { z } from 'zod';

import { OneBasedIndex } from '#root/ts/factorio/base';
import { Blueprint } from '#root/ts/factorio/blueprint.js';
import { Color } from '#root/ts/factorio/color.js';
import { DeconstructionPlanner } from '#root/ts/factorio/deconstruction_planner.js';
import { Int } from '#root/ts/factorio/int';
import { SignalID } from '#root/ts/factorio/signal_id';
import { Uint } from '#root/ts/factorio/uint';
import { UpgradePlanner } from '#root/ts/factorio/upgrade_planner.js';

export const BlueprintBookBase = z.strictObject({
	/**
	 * String, the name of the item that was saved ("blueprint-book" in vanilla).
	 */
	item: z.string(),
	/**
	 * String, the name of the blueprint set by the user.
	 */
	label: z.string(),
	/**
	 * The color of the label of this blueprint. Optional. #Color object.
	 */
	label_color: Color.optional(),

	/**
	 * Index of the currently selected blueprint, 0-based.
	 */
	active_index: Uint,
	/**
	 * The map version of the map the blueprint was created in, see Version string format.
	 */
	version: Int,

	description: z.string().optional(),

	icons: z
		.array(
			z.strictObject({
				signal: SignalID,
				index: OneBasedIndex,
			})
		)
		.optional(),
});

const optionalDeconstructionPlanner = DeconstructionPlanner.optional();
const optionalBlueprint = Blueprint.optional();
const optionalUpgradePlanner = UpgradePlanner.optional();

export type BlueprintBook = z.infer<typeof BlueprintBookBase> & {
	/**
	 * The actual content of the blueprint book, array of objects containing an "index" key and 0-based value and a "blueprint" key with a #Blueprint object as the value.
	 */
	blueprints: {
		index: z.infer<typeof Uint>;
		blueprint?: z.infer<typeof optionalBlueprint>;
		blueprint_book?: BlueprintBook;
		deconstruction_planner?: z.infer<typeof optionalDeconstructionPlanner>;
		upgrade_planner?: z.infer<typeof optionalUpgradePlanner>
	}[];
};

export const BlueprintBook: z.ZodType<BlueprintBook> = BlueprintBookBase.extend(
	{
		blueprints: z.array(
			z.strictObject({
				/**
				 * Index, 0 based value
				 */
				index: Uint,
				blueprint: optionalBlueprint,
				blueprint_book: z.lazy(() => BlueprintBook).optional(),
				deconstruction_planner: optionalDeconstructionPlanner,
				upgrade_planner: optionalUpgradePlanner,
			})
		),
	}
);
