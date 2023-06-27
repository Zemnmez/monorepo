import Head from 'next/head';
import * as bio from 'project/zemn.me/bio';
import { TimeEye } from 'project/zemn.me/elements/TimeEye';
import Timeline from 'project/zemn.me/next/pages/timeline';
import * as lang from 'ts/react/lang';
import * as kenwood from 'project/zemn.me/next/assets/kenwood';
import style from 'project/zemn.me/next/pages/index.module.css';

export default function Main() {
	return (
		<main className={style.main}>
			<Head>
				<title lang={lang.get(bio.Bio.who.handle)}>
					{lang.text(bio.Bio.who.handle)}
				</title>
				<meta
					content="zemn.me git https://github.com/zemnmez/go.git"
					name="go-import"
				/>
			</Head>

			<video className={style.headerBgv} muted loop playsInline autoPlay poster={kenwood.poster.src}>
				<kenwood.VideoSources/>
			</video>
			<header className={style.banner}>
				<h1 lang={lang.get(bio.Bio.who.handle)}>
					{lang.text(bio.Bio.who.handle)}
				</h1>
			</header>
				<section className={style.content}>
					<header>
						<h2 lang={lang.get(bio.Bio.who.fullName)}>
							{lang.text(bio.Bio.who.fullName)}
						</h2>
						<TimeEye />
						<p>I am an internationally recognised international expert on computer security, with specialisms in web security, security program construction, and automated security analysis.</p>
						<p>I am interested in consulting on legal cases. For business, email me at <a href="mailto:thomas@shadwell.im">thomas@shadwell.im</a>.</p>
					</header>
					{bio.Bio.links !== undefined ? (
						<nav>
							{bio.Bio.links.map(([text, url]) => (
								<a
									href={url.toString()}
									key={url.toString()}
									lang={lang.get(text)}
								>
									{lang.text(text)}
								</a>
							))}
						</nav>
					) : null}
					<section>
						<Timeline />
					</section>
				</section>
			</main>
	);;
}
