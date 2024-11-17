/* eslint-disable no-restricted-imports */
/* eslint-disable react/forbid-elements */
import type { UrlObject } from 'node:url';

import classNames from 'classnames';
import NextLink from 'next/link';
import { LinkProps as NextLinkProps } from 'next/link';
import React from 'react';

import { map, some } from '#root/ts/iter/index.js';
import style from '#root/ts/react/next/Link/Link.module.css';
import { RelativeURL } from '#root/ts/react/next/Link/relative_url.js';

interface SpecialProps {
	readonly href?: NextLinkProps['href']
		| RelativeURL;
	readonly styleless?: boolean
}

export type LinkProps = Omit<
	React.AnchorHTMLAttributes<HTMLAnchorElement>,
	keyof NextLinkProps & keyof SpecialProps
> &
	SpecialProps &
	Omit<NextLinkProps, keyof SpecialProps> & {
		readonly children?: React.ReactNode;
	} & React.RefAttributes<HTMLAnchorElement>;

/**
 * A set of schemes which are considered first-party
 * regardless of origin.
 */
export const firstPartySchemes = new Set(['mailto:', 'tel:']);

export const firstPartyOrigins = new Set([
	'https://zemn.me',
	'https://staging.zemn.me',
]);

/**
 * Returns true if the URL is a first-party URL if served from
 * an internal page.
 *
 * A URL is considered an internal URL if it would refer to
 * a first party origin when hosted on an internal page.
 *
 * @example
 * isFirstPartyURL("/something.html") // true
 * @example
 * isFirstPartyURL("https://example.com") // false
 * @example
 * isFirstPartyURL("https://zemn.me/ok") // true
 */
function isFirstPartyURL(u: RelativeURL | string | UrlObject | URL): boolean {

	if (u instanceof RelativeURL) return true;
	// necessary because UrlObject is not compatible with browser's
	// new URL().
	const nu = u instanceof URL ? u : typeof u === 'string' ? u : u.toString();
	return some(
		map(firstPartyOrigins, origin => new URL(nu, origin)),
		v =>
			firstPartySchemes.has(v.protocol) || firstPartyOrigins.has(v.origin)
	);
}

export function Link({ href, className, styleless, rel, target, ...props }: LinkProps) {
	if (href !== undefined && !isFirstPartyURL(href)) {
		rel = `${rel ?? ''} external`.trim();
		target = '_blank';
	}

	className = classNames(className, styleless? style.styleless : undefined)

	if (href instanceof RelativeURL) href = href.value;

	// next Link has a strangely strident stance on providing the href parameter
	// which we do not. if there is no href we just fall back to using an <a> tag.
	// https://github.com/i18next/next-i18next/issues/599
	if (href === undefined) return <a {...{ className, href, rel, target, ...props }} />;
	return <NextLink {...{ className, href, rel, target, ...props }} />;
}

export default Link;
