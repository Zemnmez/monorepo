import '@pulumi/pulumi';
import 'ts/pulumi/setMocks';

import * as project from '#root/ts/pulumi/index';

describe('pulumi', () => {
	test('smoke', async () => {
		new project.Component('monorepo', { staging: false });
		// eventually I think I need to make
		// the whole setup a custom component to make this
		// actually work.
		await new Promise(ok => setTimeout(ok, 5000));
	});
});
