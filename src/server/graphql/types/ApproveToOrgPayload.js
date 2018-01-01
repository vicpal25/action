import {GraphQLList, GraphQLObjectType} from 'graphql';
import Invitation from 'server/graphql/types/Invitation';
import NotifyInvitation from 'server/graphql/types/NotifyInvitation';
import OrgApproval from 'server/graphql/types/OrgApproval';

const ApproveToOrgPayload = new GraphQLObjectType({
  name: 'ApproveToOrgPayload',
  fields: () => ({
    removedRequestNotifications: {
      type: new GraphQLList(NotifyInvitation),
      description: 'The notifications removed after approving an email to the organization'
    },
    removedOrgApprovals: {
      type: new GraphQLList(OrgApproval),
      description: 'The org approvals that were removed in place of team members'
    },
    newInvitations: {
      type: new GraphQLList(Invitation),
      description: 'The list of team members added as a result of the approval',
      resolve: ({invitations, invitationIds}, args, {dataLoader}) => {
        return invitationIds ? dataLoader.get('invitations').loadMany(invitationIds) : invitations;
      }
    }
  })
});

export default ApproveToOrgPayload;