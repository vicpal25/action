// @flow

/**
 * Defines the js-land type of a Notification, and functions to operate on them.
 */
import type {OrgID} from './organization';
import type {ProjectID} from './project';
import type {TeamID} from './team';
import type {TeamMemberID} from './teamMember';
import type {UserID} from './user';

import shortid from 'shortid';

import {
  ADD_TO_TEAM,
  ASSIGNEE,
  DENY_NEW_USER,
  INVITEE_APPROVED,
  KICKED_OUT,
  PAYMENT_REJECTED,
  PROJECT_INVOLVES,
  PROMOTE_TO_BILLING_LEADER,
  REQUEST_NEW_USER,
  MENTIONEE,
  TEAM_ARCHIVED,
  TEAM_INVITE
} from '../utils/constants';

export type NotificationID = string;

type CommonFields = {|
  id: NotificationID, // unique notification id
  startAt: Date,      // when the notification was triggered
  userIds: UserID[]   // the users who should receive the notification
|};

type AddToTeamNotification = {|
  ...CommonFields,
  type: AddToTeamNotification,
  orgId: OrgID,
  teamId: TeamID,
  teamName: string
|};

type DenyNewUserNotification = {|
  ...CommonFields,
  type: DENY_NEW_USER,
  orgId: OrgID,
  reason: string,
  deniedByName: string,
  inviteeEmail: string
|};

type InviteeApprovedNotification = {|
  ...CommonFields,
  type: INVITEE_APPROVED,
  orgId: OrgID,
  inviteeEmail: string,
  inviterName: string,
  teamId: TeamID,
  teamName: string
|};

type KickedOutNotification = {|
  ...CommonFields,
  type: KICKED_OUT,
  teamId: TeamID,
  teamName: string,
  orgId: OrgID
|};

type PaymentRejectedNotification = {|
  ...CommonFields,
  type: PAYMENT_REJECTED,
  orgId: OrgID,
  brand: string,
  last4: string
|};

type ProjectInvolvesNotification = {|
  ...CommonFields,
  type: PROJECT_INVOLVES,
  changeAuthorId: TeamMemberID,
  involvement: ASSIGNEE | MENTIONEE,
  projectId: ProjectID,
  teamId: TeamID,
|};

type PromoteToBillingLeaderNotification = {|
  ...CommonFields,
  type: PROMOTE_TO_BILLING_LEADER,
  orgId: OrgID,
  groupName: string
|};

type RequestNewUserNotification = {|
  ...CommonFields,
  type: REQUEST_NEW_USER,
  inviteeEmail: string,
  inviterName: string,
  inviterUserId: UserID,
  orgId: OrgID,
  teamId: TeamID,
  teamName: string
|};

type TeamArchivedNotification = {|
  ...CommonFields,
  type: TEAM_ARCHIVED,
  orgId: OrgID,
  teamName: string,
|};

type TeamInviteNotification = {|
  ...CommonFields,
  type: TEAM_INVITE,
  orgId: OrgID,
  inviteeEmail: string,
  inviterName: string,
  teamId: TeamID
|};

export type Notification =
  | AddToTeamNotification
  | DenyNewUserNotification
  | InviteeApprovedNotification
  | KickedOutNotification
  | PaymentRejectedNotification
  | ProjectInvolvesNotification
  | PromoteToBillingLeaderNotification
  | RequestNewUserNotification
  | TeamArchivedNotification
  | TeamInviteNotification;

export const projectInvolvesNotification = (fields: {|
  changeAuthorId: TeamMemberID,
  involvement: ASSIGNEE | MENTIONEE,
  projectId: ProjectID,
  startAt?: Date,
  teamId: TeamID,
  userIds: UserID[]
|}): ProjectInvolvesNotification => ({
  id: shortid.generate(),
  type: PROJECT_INVOLVES,
  startAt: fields.startAt || new Date(),
  changeAuthorId: fields.changeAuthorId,
  involvement: fields.involvement,
  projectId: fields.projectId,
  teamId: fields.teamId,
  userIds: fields.userIds
});

const NOTIFICATION_TYPES_REQUIRING_ACTION = new Set([
  PAYMENT_REJECTED,
  REQUEST_NEW_USER,
  TEAM_INVITE
]);

export const notification = () => {};

// eslint-disable-next-line import/prefer-default-export
export const requiresAction = (n: Notification): bool =>
  NOTIFICATION_TYPES_REQUIRING_ACTION.has(n.type);
