import * as aws from '@pulumi/aws';
import * as Pulumi from '@pulumi/pulumi';

import Website from '#root/ts/pulumi/lib/website.js';

export interface Args {
	staging: boolean;
	tags?: Pulumi.Input<Record<string, Pulumi.Input<string>>>;
}

export class Component extends Pulumi.ComponentResource {
	site: Website;
	constructor(
		name: string,
		args: Args,
		opts?: Pulumi.ComponentResourceOptions
	) {
		super('ts:pulumi:baby.computer', name, args, opts);

		const domainName = 'baby.computer';

		const zone = aws.route53.getZone(
			{
				name: `${domainName}.`,
			},
			{ parent: this }
		);

		const domain = new aws.route53domains.RegisteredDomain(
			`${name}_domain`,
			{
				domainName,
				nameServers: zone.then(zone =>
					// this is a bit of a hack.
					// in testing, getZone is going to return undefined, because
					// obviously, it doesn't know what zones exist.
					//
					// So here we fudge it with an empty set of name servers.
					(
						(zone as aws.route53.GetZoneResult | undefined)
							?.nameServers ?? []
					).map(name => ({ name }))
				),
			},
			{ parent: this }
		);

		this.site = new Website(
			`${name}_baby.computer`,
			{
				noCostAllocationTag: true,
				index: 'ts/pulumi/baby.computer/out/index.html',
				notFound: 'ts/pulumi/baby.computer/out/index.html',
				directory: 'ts/pulumi/baby.computer/out',
				zoneId: zone.then(zone => zone.zoneId),
				domain: domain.domainName.apply(domainName =>
					[...(args.staging ? ['staging'] : []), domainName].join('.')
				),
				noIndex: args.staging,
				email: true,
			},
			{ parent: this }
		);
	}
}