const mockSelection = {
  enter: jest.fn().mockReturnThis(),
  exit: jest.fn().mockReturnThis(),
  append: jest.fn().mockReturnThis(),
  attr: jest.fn().mockReturnThis(),
  style: jest.fn().mockReturnThis(),
  data: jest.fn().mockReturnThis(),
  merge: jest.fn().mockReturnThis(),
  transition: jest.fn().mockReturnThis(),
  duration: jest.fn().mockReturnThis(),
  remove: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  text: jest.fn().mockReturnThis(),
  filter: jest.fn().mockReturnThis(),
  on: jest.fn().mockReturnThis(),
  selectAll: jest.fn().mockReturnThis(),
};

const mockContainer = {
  select: jest.fn().mockReturnValue(mockSelection),
  selectAll: jest.fn().mockReturnValue(mockSelection),
  append: jest.fn().mockReturnValue(mockSelection),
  attr: jest.fn().mockReturnThis(),
  style: jest.fn().mockReturnThis(),
  node: jest.fn(),
  getBoundingClientRect: jest.fn().mockReturnValue({ width: 800, height: 600 }),
};

export const select = jest.fn().mockReturnValue(mockContainer);
export const selectAll = jest.fn().mockReturnValue(mockSelection);
export const hierarchy = jest.fn();
export const tree = jest.fn();

export default {
  select,
  selectAll,
  hierarchy,
  tree,
}; 