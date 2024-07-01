import { z } from 'zod';

import { Uint } from '#root/ts/factorio/uint';

export const ProgrammableSpeakerCircuitParameters = z.strictObject({
	signal_value_is_pitch: z.boolean(),
	instrument_id: Uint,
	note_id: Uint,
});

export type ProgrammableSpeakerCircuitParameters = z.TypeOf<
	typeof ProgrammableSpeakerCircuitParameters
>;
