/**
 * The reflection card presentational component.
 *
 * @flow
 */
// $FlowFixMe
import {EditorState, ContentState} from 'draft-js';
import React, {Component} from 'react';
import styled, {css} from 'react-emotion';

import EditorInputWrapper from 'universal/components/EditorInputWrapper';
import ReflectionCardWrapper from 'universal/components/ReflectionCardWrapper/ReflectionCardWrapper';
import editorDecorators from 'universal/components/TaskEditor/decorators';
import appTheme from 'universal/styles/theme/appTheme';

import ReflectionCardDeleteButton from './ReflectionCardDeleteButton';

type Stage = 'positive' | 'negative' | 'change';

export type Props = {|
  // The draft-js content for this card
  contentState: ContentState,
  // The action to take when this card is deleted
  handleDelete?: () => any,
  // The action to take when this card is saved
  handleSave?: (editorState: EditorState) => any,
  // True when this card is being hovered over by a valid drag source
  hovered?: boolean,
  // True when the current user is the one dragging this card
  iAmDragging?: boolean,
  // The unique ID of this reflection card
  id: string,
  // Provided by react-dnd
  isDragging?: boolean,
  // States whether it serves as a drag preview.
  pulled?: boolean,
  // The stage of the meeting this was created during
  stage?: Stage,
  // The name of the user who is currently dragging this card to a new place, if any
  userDragging?: string,
|};

type State = {
  editorState: EditorState,
  mouseOver: boolean
};

type DnDStylesWrapperProps = {
  hovered?: boolean,
  pulled?: boolean,
  iAmDragging?: boolean
};

const BottomBar = styled('div')({
  alignItems: 'flex-start',
  color: appTheme.palette.mid,
  display: 'flex',
  fontSize: '0.9rem',
  justifyContent: 'space-between',
  padding: '0.4rem 0.8rem'
});

const DnDStylesWrapper = styled('div')(({pulled, iAmDragging}: DnDStylesWrapperProps) => ({
  opacity: ((iAmDragging && !pulled)) && 0.6
}));

const ReflectionCardMain = styled('div')({
  maxHeight: '10rem',
  overflow: 'auto',
  padding: '0.8rem'
});

const getDisplayName = (stage: ?Stage): string => {
  switch (stage) {
    case 'positive':
      return "What's working?";
    case 'negative':
      return 'Where did you get stuck?';
    case 'change':
      return 'What might we do differently next time?';
    default:
      return '';
  }
};

export default class ReflectionCard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      confirmingDelete: false,
      editorState: EditorState.createWithContent(
        props.contentState,
        editorDecorators(this.getEditorState)
      ),
      mouseOver: false
    };
  }

  getEditorState = () => (
    this.state.editorState
  );

  setEditorState = (editorState: EditorState) => {
    this.setState({editorState});
  };

  canDelete = () => (
    Boolean(this.props.handleDelete)
  );

  delete = () => {
    if (this.props.handleDelete) {
      this.props.handleDelete();
    }
  };

  saveDeleteButton = (deleteButton: ?HTMLButtonElement) => {
    this.deleteButton = deleteButton;
  };

  deleteButton: ?HTMLButtonElement;

  maybeRenderDelete = () => {
    const {mouseOver} = this.state;
    return this.canDelete() && (
      <ReflectionCardDeleteButton
        innerRef={this.saveDeleteButton}
        isVisible={mouseOver}
        onBlur={() => this.setState({mouseOver: false})}
        onClick={this.delete}
        onFocus={() => this.setState({mouseOver: true})}
      />
    );
  };

  maybeRenderStage = () => {
    const {stage} = this.props;
    return stage && <BottomBar>{getDisplayName(this.props.stage)}</BottomBar>;
  };

  maybeRenderUserDragging = () => {
    const {isDragging, pulled, userDragging} = this.props;
    const styles = {
      color: appTheme.palette.warm,
      textAlign: 'end'
    };
    return (isDragging && !pulled) && (
      <div className={css(styles)}>
        {userDragging}
      </div>
    );
  };

  handleMouseEnter = () => {
    this.setState({mouseOver: true});
  };

  handleMouseLeave = () => {
    this.setState({mouseOver: false});
  };

  renderCardContent = () => {
    const {handleSave} = this.props;
    const {editorState} = this.state;
    return handleSave ? (
      <EditorInputWrapper
        ariaLabel="Edit this reflection"
        editorState={editorState}
        handleReturn={() => 'not-handled'}
        onBlur={handleSave && (() => handleSave(editorState))}
        placeholder="My reflection thought..."
        setEditorState={this.setEditorState}
      />
    ) : (
      <div>{editorState.getCurrentContent().getPlainText()}</div>
    );
  };

  render() {
    const {hovered, iAmDragging, pulled, userDragging} = this.props;
    const holdingPlace = Boolean(userDragging && !pulled);
    return (
      <DnDStylesWrapper pulled={pulled} iAmDragging={iAmDragging} hovered={hovered}>
        {this.maybeRenderUserDragging()}
        <ReflectionCardWrapper
          holdingPlace={holdingPlace}
          hoveringOver={hovered}
          pulled={pulled}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
        >
          <ReflectionCardMain>
            {this.renderCardContent()}
          </ReflectionCardMain>
          {this.maybeRenderStage()}
          {this.maybeRenderDelete()}
        </ReflectionCardWrapper>
      </DnDStylesWrapper>
    );
  }
}
