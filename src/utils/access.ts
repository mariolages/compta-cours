export const isFirstYearClass = (classCode: string | undefined): boolean => {
  return classCode?.endsWith('1') || false;
};

export const isCourseCategory = (categoryId: string): boolean => {
  return categoryId === "1";
};

export const hasAccessToContent = (
  hasSubscription: boolean,
  classCode: string | undefined,
  categoryId: string
): boolean => {
  return hasSubscription || (isFirstYearClass(classCode) && isCourseCategory(categoryId));
};