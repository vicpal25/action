const pluralizeHandler = (handler) => (newNodeOrNodes, ...args) => {
  if (!newNodeOrNodes) return;
  if (Array.isArray(newNodeOrNodes)) {
    for (let ii = 0; ii < newNodeOrNodes.length; ii++) {
      const newNode = newNodeOrNodes[ii];
      handler(newNode, ...args);
    }
  } else {
    handler(newNodeOrNodes, ...args);
  }
};

export default pluralizeHandler;
