import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {DropTarget as dropTarget} from 'react-dnd';
import FontAwesome from 'react-fontawesome';
import {AutoSizer, CellMeasurer, CellMeasurerCache, List} from 'react-virtualized';
import shortid from 'shortid';
import AddProjectButton from 'universal/components/AddProjectButton/AddProjectButton';
import Badge from 'universal/components/Badge/Badge';
import ProjectCardContainer from 'universal/containers/ProjectCard/ProjectCardContainer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import handleColumnHover from 'universal/dnd/handleColumnHover';
import handleDrop from 'universal/dnd/handleDrop';
import withDragState from 'universal/dnd/withDragState';
import {Menu, MenuItem} from 'universal/modules/menu';
import CreateProjectMutation from 'universal/mutations/CreateProjectMutation';
import {overflowTouch} from 'universal/styles/helpers';
import projectStatusStyles from 'universal/styles/helpers/projectStatusStyles';
import appTheme from 'universal/styles/theme/appTheme';
import themeLabels from 'universal/styles/theme/labels';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {PROJECT, TEAM_DASH, USER_DASH} from 'universal/utils/constants';
import dndNoise from 'universal/utils/dndNoise';
import getNextSortOrder from 'universal/utils/getNextSortOrder';
import isUndefined from 'universal/utils/isUndefined';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

const columnTarget = {
  drop: handleDrop,
  hover: handleColumnHover
};

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

const badgeColor = {
  done: 'dark',
  active: 'cool',
  stuck: 'warm',
  future: 'mid'
};

const handleAddProjectFactory = (atmosphere, dispatch, history, status, teamMemberId, sortOrder) => () => {
  const [, teamId] = teamMemberId.split('::');
  const newProject = {
    id: `${teamId}::${shortid.generate()}`,
    status,
    teamMemberId,
    sortOrder
  };
  CreateProjectMutation(atmosphere, newProject);
};

class ProjectColumn extends Component {
  state = {
    editingCounter: 0
  };

  componentWillUpdate(nextProps) {
    this.updateCellCache(this.props.projects, nextProps.projects);
  }

  cellCache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 150
  });

  makeAddProject = () => {
    const {
      area,
      atmosphere,
      dispatch,
      history,
      status,
      projects,
      myTeamMemberId,
      queryKey,
      teams,
      userId
    } = this.props;
    const label = themeLabels.projectStatus[status].slug;
    const sortOrder = getNextSortOrder(projects, dndNoise());
    if (area === TEAM_DASH) {
      const teamMemberId = queryKey.indexOf('::') === -1 ? myTeamMemberId : queryKey;
      const handleAddProject = handleAddProjectFactory(atmosphere, dispatch, history, status, teamMemberId, sortOrder);
      return <AddProjectButton onClick={handleAddProject} label={label} />;
    } else if (area === USER_DASH) {
      if (teams.length === 1) {
        const {id: teamId} = teams[0];
        const generatedMyTeamMemberId = `${userId}::${teamId}`;
        const handleAddProject = handleAddProjectFactory(atmosphere, dispatch, history, status, generatedMyTeamMemberId, sortOrder);
        return <AddProjectButton onClick={handleAddProject} label={label} />;
      }
      const itemFactory = () => {
        const menuItems = this.makeTeamMenuItems(atmosphere, dispatch, history, sortOrder);
        return menuItems.map((item) =>
          (<MenuItem
            key={`MenuItem${item.label}`}
            label={item.label}
            onClick={item.handleClick}
          />)
        );
      };

      const toggle = <AddProjectButton label={label} />;
      return (
        <Menu
          itemFactory={itemFactory}
          originAnchor={originAnchor}
          menuWidth="10rem"
          targetAnchor={targetAnchor}
          toggle={toggle}
          label="Select Team:"
        />
      );
    }
    return null;
  };

  makeTeamMenuItems = (atmosphere, dispatch, history, sortOrder) => {
    const {
      status,
      teams,
      userId
    } = this.props;
    return teams.map((team) => ({
      label: team.name,
      handleClick: () => {
        const newProject = {
          id: `${team.id}::${shortid.generate()}`,
          status,
          teamMemberId: `${userId}::${team.id}`,
          sortOrder
        };
        CreateProjectMutation(atmosphere, newProject);
      }
    }));
  };

  projectCardRowRenderer = ({index, key, parent, style}) => {
    const {area, dragState, projects, userId} = this.props;
    const project = projects[index % projects.length];
    return (
      <CellMeasurer
        cache={this.cellCache}
        columnIndex={0}
        key={key}
        rowIndex={index}
        parent={parent}
      >
        <div style={style}>
          <ProjectCardContainer
            area={area}
            project={project}
            dragState={dragState}
            myUserId={userId}
            ref={(c) => {
              if (c) {
                dragState.components.push(c);
              }
            }}
            onEdit={() => {
              this.cellCache.clear(index);
              this.setState(({editingCounter}) => ({editingCounter: editingCounter + 1}));
            }}
          />
        </div>
      </CellMeasurer>
    );
  };

  updateCellCache = (currentProjects, nextProjects) => {
    const maxLength = Math.max(currentProjects.length, nextProjects.length);
    for (let i = 0; i < maxLength; i++) {
      if (isUndefined(currentProjects[i]) || isUndefined(nextProjects[i]) || currentProjects[i].content !== nextProjects[i].content) {
        this.cellCache.clear(i);
      }
    }
  };

  render() {
    const {
      connectDropTarget,
      firstColumn,
      lastColumn,
      status,
      projects,
      styles
    } = this.props;
    const label = themeLabels.projectStatus[status].slug;
    const columnStyles = css(
      styles.column,
      firstColumn && styles.columnFirst,
      lastColumn && styles.columnLast
    );

    // reset every rerender so we make sure we got the freshest info
    return connectDropTarget(
      <div className={columnStyles}>
        <div className={css(styles.columnHeader)}>
          <div className={css(styles.statusLabelBlock)}>
            <span className={css(styles.statusIcon, styles[status])}>
              <FontAwesome name={themeLabels.projectStatus[status].icon} />
            </span>
            <span className={css(styles.statusLabel, styles[status])}>
              {label}
            </span>
            {(projects.length > 0) &&
            <span className={css(styles.statusBadge)}>
              <Badge colorPalette={badgeColor[status]} flat value={projects.length} />
            </span>
            }
          </div>
          {this.makeAddProject()}
        </div>
        <div className={css(styles.columnBody)}>
          <div className={css(styles.columnInner)}>
            <AutoSizer>
              {({height, width}) => (
                <List
                  aria-readonly={false}
                  deferredMeasurementCache={this.cellCache}
                  height={height}
                  width={width}
                  rowCount={projects.length}
                  rowHeight={this.cellCache.rowHeight}
                  rowRenderer={this.projectCardRowRenderer}
                  projects={projects} // forces updates when `projects` changes, since `List` is a PureComponent
                  cellToReRender={this.state.editingCounter} // forces update when a cell's size changes but `projects` does not
                />
              )}
            </AutoSizer>
          </div>
        </div>
      </div>
    );
  }
}

ProjectColumn.propTypes = {
  area: PropTypes.string,
  atmosphere: PropTypes.object.isRequired,
  connectDropTarget: PropTypes.func,
  dispatch: PropTypes.func.isRequired,
  dragState: PropTypes.object,
  firstColumn: PropTypes.bool,
  history: PropTypes.object.isRequired,
  lastColumn: PropTypes.bool,
  myTeamMemberId: PropTypes.string,
  projects: PropTypes.array.isRequired,
  queryKey: PropTypes.string,
  status: PropTypes.string,
  styles: PropTypes.object,
  teams: PropTypes.array,
  userId: PropTypes.string
};

const styleThunk = () => ({
  column: {
    borderLeft: `2px dashed ${ui.dashBorderColor}`,
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    overflow: 'auto',
    position: 'relative',
    width: '25%'
  },

  columnFirst: {
    borderLeft: 0
  },

  columnLast: {
    // keeping this around, we may need it (TA)
  },

  columnHeader: {
    color: appTheme.palette.dark,
    display: 'flex !important',
    lineHeight: '1.5rem',
    padding: '.5rem 1rem',
    position: 'relative'
  },

  columnBody: {
    flex: 1,
    position: 'relative'
  },

  columnInner: {
    ...overflowTouch,
    height: '100%',
    padding: '0 1rem',
    position: 'absolute',
    width: '100%'
  },

  statusLabelBlock: {
    alignItems: 'center',
    display: 'flex',
    flex: 1,
    fontSize: appTheme.typography.s3
  },

  statusIcon: {
    fontSize: '14px',
    marginRight: '.25rem',
    paddingTop: 1,
    textAlign: 'center',
    verticalAlign: 'middle'
  },

  statusLabel: {
    fontWeight: 700,
    paddingTop: 2,
    textTransform: 'uppercase'
  },

  statusBadge: {
    marginLeft: '.5rem'
  },

  ...projectStatusStyles('color')
});

const dropTargetCb = (connectTarget) => ({
  connectDropTarget: connectTarget.dropTarget()
});

export default connect()(
  withAtmosphere(
    withRouter(
      withDragState(
        dropTarget(PROJECT, columnTarget, dropTargetCb)(
          withStyles(styleThunk)(ProjectColumn)
        )
      )
    )
  )
);
