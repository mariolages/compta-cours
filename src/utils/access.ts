export const isFirstYearClass = (classCode: string | undefined): boolean => {
  return classCode?.endsWith('1') || false;
};

export const isCourseCategory = (categoryId: string): boolean => {
  return categoryId === "1";
};

export const isChapterOne = (title: string | undefined): boolean => {
  const pattern = /^(?:chapitre|chap\.?|ch\.?)\s*1(?:\s|$)/i;
  return title ? pattern.test(title.toLowerCase()) : false;
};

export const hasAccessToContent = (
  hasSubscription: boolean,
  classCode: string | undefined,
  categoryId: string,
  fileTitle?: string
): boolean => {
  // Si l'utilisateur a un abonnement, il a accès à tout
  if (hasSubscription) {
    console.log('Accès accordé - Abonnement actif');
    return true;
  }
  
  // Les utilisateurs non abonnés peuvent accéder au Chapitre 1 dans la catégorie Cours
  const hasFreeAccess = isCourseCategory(categoryId) && isChapterOne(fileTitle);
  console.log('Accès gratuit ?', hasFreeAccess, {
    isCourse: isCourseCategory(categoryId),
    isChap1: isChapterOne(fileTitle),
    categoryId,
    fileTitle
  });
  
  return hasFreeAccess;
};