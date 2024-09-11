import Link from '#root/project/zemn.me/components/Link/index.js';
import { Prose } from '#root/project/zemn.me/components/Prose/prose';

export default function Page() {
	return (
		<Prose>
			<h1>Factorio Blueprint Experiments</h1>
			<ul>
				<li>
					<Link href="blueprint/parse">Blueprint parser</Link>
				</li>
				<li>
					<Link href="blueprint/request">
						Blueprint requester chest generator
					</Link>
				</li>
				<li>
					<Link href="blueprint/wall">
						Adds a wall around the entities and tiles of a
						blueprint.
					</Link>
				</li>
				<li>
					<Link href="blueprint/book">
						Some blueprints I like (and/or made).
					</Link>
				</li>
			</ul>
		</Prose>
	);
}
