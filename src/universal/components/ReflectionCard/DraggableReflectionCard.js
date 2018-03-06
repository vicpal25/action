/**
 * A drag-and-drop enabled reflection card.
 *
 * @flow
 */
import type {Node} from 'react';
import type {Props as ReflectionCardProps} from './ReflectionCard';

import React from 'react';
import {DragSource} from 'react-dnd';

import ReflectionCard from './ReflectionCard';

type Props = {
  ...ReflectionCardProps,
  connectDragSource: (Node) => Node,
  isDragging: boolean
};

const DraggableReflectionCard = (props: Props) => {
  const reflectionCardProps: ReflectionCardProps = Object.entries(props)
    .filter(([key]) => key !== 'connectDragSource')
    .reduce((acc, [key, val]) => ({...acc, [key]: val}), {});
  return props.connectDragSource(
    <div style={{display: 'inline-block'}}>
      <ReflectionCard {...reflectionCardProps} />
    </div>
  );
};

const RETRO_CARD_TYPE = 'RETRO_CARD_TYPE';

const cardSource = {
  beginDrag: (props: Props) => ({
    id: props.id
  })
};

// TODO: - can we get the current user in the collect function?
export default DragSource(RETRO_CARD_TYPE, cardSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(DraggableReflectionCard);
