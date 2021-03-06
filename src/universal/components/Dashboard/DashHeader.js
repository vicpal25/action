import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';

const DashHeader = (props) => {
  const {children, hasOverlay, styles} = props;
  const rootStyles = css(
    styles.root,
    hasOverlay && styles.hasOverlay
  );
  return (
    <div className={rootStyles}>
      {children}
    </div>
  );
};

DashHeader.propTypes = {
  children: PropTypes.any,
  hasOverlay: PropTypes.bool,
  styles: PropTypes.object
};

const styleThunk = () => ({
  root: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottom: `1px solid ${ui.dashBorderColor}`,
    display: 'flex',
    minHeight: '4.875rem',
    padding: `0 ${ui.dashGutter}`,
    width: '100%'
  },

  hasOverlay: {
    filter: ui.filterBlur
  }
});

export default withStyles(styleThunk)(DashHeader);
