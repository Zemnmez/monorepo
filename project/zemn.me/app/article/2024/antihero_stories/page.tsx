
import { Metadata } from 'next/types';

import Content from '#root/mdx/article/2024/antihero_stories.js'
import { frontmatter } from '#root/mdx/article/2024/antihero_stories.js';
import { articleMetadata } from '#root/project/zemn.me/components/Article/article_metadata.js';
import { MDXArticle } from '#root/project/zemn.me/components/Article/mdx_article.js';



export default function Page() {
	return <MDXArticle {...{frontmatter}}>
		<Content/>
	</MDXArticle>
}

export const metadata: Metadata = articleMetadata(frontmatter);
