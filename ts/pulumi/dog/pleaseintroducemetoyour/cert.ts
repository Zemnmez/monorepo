import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { zone } from 'monorepo/ts/pulumi/dog/pleaseintroducemetoyour/zone';

export const cert = new aws.acm.Certificate(
	'pleaseintroducemetoyour.dog_cert',
	{
		domainName: zone.name,
		validationMethod: 'DNS',
	}
);

const second = 1;
const minute = 60 * second;

// this code seems stupid but you can't iterate over a list
// in pulumi outputs so it's necessary.

// NB: number of validations is the number of domains https://github.com/pulumi/pulumi/issues/5736#issuecomment-725767836

const record = (
	name: string,
	validation: pulumi.Output<aws.types.output.acm.CertificateDomainValidationOption>
) =>
	new aws.route53.Record(name, {
		name: validation.resourceRecordName,
		records: [validation.resourceRecordValue],
		type: validation.resourceRecordType,
		zoneId: zone.zoneId,
		ttl: 1 * minute, // because these really don't need to be cached
	});

export const validation0 = record(
	'cert_validation_0',
	cert.domainValidationOptions[0]
);

export const validation = new aws.acm.CertificateValidation('cert-validation', {
	certificateArn: cert.arn,
	validationRecordFqdns: [validation0.fqdn],
});

// should use this one because it waits for the certificate to actualy be validated
export const arn = validation.certificateArn;

export default cert;
