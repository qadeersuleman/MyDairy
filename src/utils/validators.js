// validators
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidTask = (task) => {
  return task.title && task.title.trim().length > 0;
};