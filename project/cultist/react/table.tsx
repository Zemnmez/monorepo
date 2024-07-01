import React, { Fragment } from 'react';

import * as State from '#root/project/cultist/state/index';
import { map } from '#root/ts/iter/index';
// stubbed out because IDK how to fix style issues right now.
//import style from './table.module.css';

export interface TableProps {
	state: State.State;
	onElementChange: (
		elementkey: string,
		newElement: State.ElementInstance
	) => void;
}

export const Table: React.FC<Readonly<TableProps>> = ({
	onElementChange,
	state,
}) => {
	const onElementMove = React.useCallback(
		(
			X: number,
			Y: number,
			elementKey: string,
			element: State.ElementInstance
		) =>
			onElementChange(
				elementKey,
				element.withMutations(el =>
					el.set('lastTablePosX', X).set('lastTablePosY', Y)
				)
			),
		[onElementChange]
	);
	return (
		<>
			{state.metainfo && state.metainfo.VERSIONNUMBER !== undefined ? (
				<figure>
					<figcaption>Metadata</figcaption>
					<dl>
						<dt>Version Number</dt>
						<dd>{state.metainfo.VERSIONNUMBER}</dd>
					</dl>
				</figure>
			) : null}
			{state.characterDetails ? (
				<figure>
					<header>Character Details</header>
					<dl>
						<dt>Name</dt>
						<dd>{state.characterDetails.toJSON().name}</dd>

						<dt>Profession</dt>
						<dd>{state.characterDetails.profession}</dd>
					</dl>
				</figure>
			) : null}

			<Board onElementMove={onElementMove} state={state} />

			{state.decks && state.decks.size > 0 ?
				<figure>
					<figcaption>Decks</figcaption>
					<dl>
						{[...map(state.decks.entries(), ([k, v]) => <Fragment key={k}>
							<dl>{k}</dl>
							<dd><dl>
								{v.cards && v.cards.size > 0 ? <Fragment>
									<dt>Cards</dt>
									<dd><ol>{v.cards.map(card => <li>{card}</li>)}</ol></dd>
								</Fragment> : null}
							</dl>
							<dl>
								{v.eliminatedCards && v.eliminatedCards.size > 0 ? <Fragment>
									<dt>Eliminated Cards</dt>
									<dd><ol>{v.eliminatedCards.map(card => <li>{card}</li>)}</ol></dd>
								</Fragment> : null}
							</dl>

							</dd>
						</Fragment>)]}
					</dl>
				</figure>
				: null}
		</>
	);
};

export interface SlotProps {
	readonly X: number;
	readonly Y: number;
	readonly width: number;
	readonly height: number;
	readonly onDrop: (
		X: number,
		Y: number,
		event: React.DragEvent<HTMLDivElement>
	) => void;
}

export const Slot: React.FC<SlotProps> = ({
	X,
	Y,
	width,
	height,
	onDrop: _onDrop,
}) => {
	const onDragOver: React.DragEventHandler<HTMLDivElement> =
		React.useCallback(e => {
			e.preventDefault();
		}, []);

	const onDrop: React.DragEventHandler<HTMLDivElement> = React.useCallback(
		e => _onDrop(X, Y, e),
		[X, Y, _onDrop]
	);

	return (
		<foreignObject height={height} width={width} x={X} y={Y}>
			<div
				onDragOver={onDragOver}
				onDrop={onDrop}
				style={{ width: '100%', height: '100%' }}
			/>
		</foreignObject>
	);
};

export interface BoardProps {
	readonly state: State.State;
	readonly minX?: number;
	readonly minY?: number;
	readonly maxX?: number;
	readonly maxY?: number;
	readonly cardWidth?: number;
	readonly cardHeight?: number;
	readonly defaultX?: number;
	readonly defaultY?: number;
	readonly snapGridWidth?: number;
	readonly snapGridHeight?: number;
}

export interface BoardProps {
	readonly state: State.State;
	readonly onElementMove: (
		X: number,
		Y: number,
		stateKey: string,
		element: State.ElementInstance
	) => void;
}

export const Board: React.FC<BoardProps> = ({
	state: { elementStacks },
	minX = State.boardMinX,
	maxX = State.boardMaxX,
	maxY = State.boardMaxY,
	minY = State.boardMinY,
	cardHeight = State.cardHeight,
	cardWidth = State.cardWidth,
	snapGridWidth = State.cardWidth,
	snapGridHeight = State.cardHeight,
	onElementMove,
}) => {
	const onDrop = React.useCallback(
		(x: number, y: number, event: React.DragEvent<HTMLDivElement>) => {
			const { elementKey } = JSON.parse(
				event.dataTransfer.getData('application/json+elementKey')
			) as { elementKey: string };
			onElementMove(x, y, elementKey, elementStacks!.get(elementKey)!);
		},
		[elementStacks, onElementMove]
	);

	const droppableSlots = [];

	for (let x = minX; x < maxX; x += snapGridWidth) {
		for (let y = minY; y < maxY; y += snapGridHeight) {
			droppableSlots.push(
				<Slot
					X={x}
					Y={y}
					height={snapGridHeight}
					key={`${x}-${y}`}
					onDrop={onDrop}
					width={snapGridWidth}
				/>
			);
		}
	}

	return (
		<svg>
			{droppableSlots}
			{elementStacks?.map((e, i) => (
				<Card
					element={e}
					elementKey={i}
					h={cardHeight}
					key={i}
					w={cardWidth}
				/>
			)) ?? null}
		</svg>
	);
};

export interface DeckProps {
	name: string;
	deck: State.Deck;
}

export const Deck: React.FC<Readonly<DeckProps>> = ({ name, deck }) => (
	<figure>
		<figcaption>Deck: {name}</figcaption>

		{(deck.eliminatedCards?.size ?? 0) > 0 ? (
			<figure>
				<figcaption>Eliminated Cards</figcaption>
				<ol>
					{deck.eliminatedCards?.map(name => (
						<li key={name}>{name}</li>
					))}
				</ol>
			</figure>
		) : null}

		{(deck.cards?.size ?? 0) > 0 ? (
			<figure>
				<figcaption>Cards</figcaption>
				<ol>{deck.cards?.map(name => <li key={name}>{name}</li>)}</ol>
			</figure>
		) : null}
	</figure>
);

export interface CardProps {
	element: State.ElementInstance;
	elementKey: string;
	h: number;
	w: number;
}

export const Card: React.FC<Readonly<CardProps>> = ({
	elementKey,
	h,
	w,
	element: e,
}) => {
	const onDragStart: React.DragEventHandler<HTMLDivElement> =
		React.useCallback(
			ev => {
				if (!('datatransfer' in ev)) return;
				ev.dataTransfer.effectAllowed = 'move';
				ev.dataTransfer.setData(
					'application/json+elementKey',
					JSON.stringify({
						elementKey,
					})
				);
			},
			[elementKey]
		);
	return (
		<foreignObject
			height={h}
			width={w}
			x={e.lastTablePosX ?? 0}
			y={e.lastTablePosY ?? 0}
		>
			{/* needed to inject xmlns, not in types */}
			<div
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				{...({ xmlns: 'http://www.w3.org/1999/xhtml' } as any)}
				draggable="true"
				onDragStart={onDragStart}
			>
				{/* this is thomas again. I have no idea what this ^ was meant to mean */}
				{e.elementId} ({e.quantity}) ({e.lifetimeRemaining}s)
			</div>
		</foreignObject>
	);
};

export interface CardTimeDisplayProps {
	seconds?: number;
}

export const CardTimeDisplay: React.FC<Readonly<CardTimeDisplayProps>> = ({
	seconds,
}) => (seconds !== undefined ? <>expires in: {seconds} seconds</> : null);
