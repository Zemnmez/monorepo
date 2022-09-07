import * as Url from 'monorepo/ts/url';
import React from 'react';

type AElement = React.ReactElement<
	React.DetailedHTMLProps<
		React.AnchorHTMLAttributes<HTMLAnchorElement>,
		HTMLAnchorElement
	>
>;

export interface LinkProps {
	href?: Url.URL;
	children: AElement;
}

export const Link: React.FC<LinkProps> = ({
	href,
	children: child,
}: LinkProps) =>
	React.cloneElement(
		child,
		{
			...child.props,
			href: href?.toString(),
		}
		//...child.props?.children,
	);

export default Link;
