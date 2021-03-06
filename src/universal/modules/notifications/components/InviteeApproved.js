import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import {withRouter} from 'react-router-dom';
import Button from 'universal/components/Button/Button';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';
import Row from 'universal/components/Row/Row';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {clearNotificationLabel} from '../helpers/constants';

const InviteeApproved = (props) => {
  const {
    atmosphere,
    styles,
    notification,
    submitMutation,
    onError,
    onCompleted,
    history
  } = props;
  const {notificationId, inviteeEmail, team} = notification;
  const {teamId, teamName} = team;
  const acknowledge = () => {
    submitMutation();
    ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted);
  };
  const goToTeam = () => history.push(`/team/${teamId}`);
  return (
    <Row compact>
      <div className={css(styles.icon)}>
        <IconAvatar icon="user-circle-o" size="small" />
      </div>
      <div className={css(styles.message)}>
        <b>{inviteeEmail}</b>
        {' has been approved to join '}
        <span className={css(styles.messageVar, styles.notifLink)} onClick={goToTeam}>{teamName}</span>{'.'}
        <br />
        {'We have sent them an invitation.'}
      </div>
      <div className={css(styles.iconButton)}>
        <Button
          aria-label={clearNotificationLabel}
          buttonSize="small"
          colorPalette="gray"
          icon="check"
          isBlock
          type="submit"
          onClick={acknowledge}
        />
      </div>
    </Row>
  );
};

InviteeApproved.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  styles: PropTypes.object,
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  notification: PropTypes.object.isRequired
};

const styleThunk = () => ({
  ...defaultStyles,

  button: {
    marginLeft: ui.rowCompactGutter,
    minWidth: '3.5rem'
  }
});


export default createFragmentContainer(
  withRouter(withStyles(styleThunk)(InviteeApproved)),
  graphql`
    fragment InviteeApproved_notification on NotifyInviteeApproved {
      notificationId: id
      inviteeEmail
      team {
        teamId: id
        teamName: name
      }
    }
  `
);
