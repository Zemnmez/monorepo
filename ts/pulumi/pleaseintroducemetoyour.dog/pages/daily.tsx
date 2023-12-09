import classNames from 'classnames';
import Link from 'project/zemn.me/next/components/Link';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Post {
	media?: {
		reddit_video?: {
			dash_url?: string;
			hls_url?: string;
			fallback_url?: string;
			scrubber_media_url?: string;
		};
	} | void;
	preview: {
		images?: {
			source?: {
				width?: number;
			};
		}[];
	};
	url?: string;
	permalink: string;
	title: string;
}

interface SearchResponse {
	data?: {
		children?: {
			data: Post;
		}[];
	};
}

function Post(post: Post) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const onClick = useCallback(() => void videoRef.current?.play(), []);
	const video = post?.media?.reddit_video;
	return (
		<article
			className={classNames('post', post.media ? 'media' : undefined)}
			onClick={onClick}
		>
			{post.media ? (
				<video autoPlay loop muted playsInline ref={videoRef}>
					{[video?.hls_url, video?.dash_url, video?.fallback_url].map(
						source =>
							source ? <source key={source} src={source} /> : null
					)}
				</video>
			) : (
				<img src={post.url?.replace(/\.gifv$/, 'gif')} />
			)}
			<Link href={'https://reddit.com' + post.permalink}>
				<header>{post.title}</header>
			</Link>
		</article>
	);
}

export default function Main() {
	const [searchResponse, setSearchResponse] = useState<SearchResponse>();

	useEffect(() => {
		void fetch(
			`https://www.reddit.com/r/aww/search.json?raw_json=1&q=dog&sort=top&t=day&restrict_sr=1`
		)
			.then(r => r.json())
			.then(j => setSearchResponse(() => j));
	}, []);

	if (!searchResponse) return 'loading doggs ... 🤔🤔';

	return (
		<>
			<h1>Top doggoes of the day!!</h1>
			{searchResponse?.data?.children?.map((post, i) => (
				<Post key={i} {...post.data} />
			)) ?? 'we had an issue loading them ... 🐕😭'}
			<h1>That’s all for today ‼️ Check back tomorrow 🐕</h1>
		</>
	);
}
