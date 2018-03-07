/**
 * A drag-and-drop enabled reflection card.
 *
 * @flow
 */
import type {Node} from 'react';
import type {Props as ReflectionCardProps} from './ReflectionCard';

import React from 'react';
import {DragSource} from 'react-dnd';

import without from 'universal/utils/without';

import ReflectionCard from './ReflectionCard';

type Props = {
  ...ReflectionCardProps,
  connectDragSource: (Node) => Node,
  handleBeginDrag: (draggedCardId: string) => any,
  handleEndDrag: (draggedCardId: string) => any,
  isDragging: boolean
};

const DraggableReflectionCard = (props: Props) => {
  const reflectionCardProps = without(props, 'connectDragSource');
  return props.connectDragSource(
    <div style={{display: 'inline-block'}}>
      <ReflectionCard {...reflectionCardProps} />
    </div>
  );
};

const RETRO_CARD_TYPE = 'RETRO_CARD_TYPE';

const cardSpec = {
  beginDrag(props: Props) {
    const {handleBeginDrag, id} = props;
    handleBeginDrag(id);
    return {id};
  },

  endDrag(props: Props) {
    const {handleEndDrag, id} = props;
    handleEndDrag(id);
  }
};

// TODO: - can we get the current user in the collect function?
export default DragSource(RETRO_CARD_TYPE, cardSpec, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(DraggableReflectionCard);
