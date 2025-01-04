export const isFirstYearClass = (classCode: string | undefined): boolean => {
  return classCode?.endsWith('1') || false;
};

export const isCourseCategory = (categoryId: string): boolean => {
  return categoryId === "1";
};

export const isChapterOne = (title: string | undefined): boolean => {
  // Check if the title contains "chapitre 1", "chap 1", "chap. 1", "ch 1", "ch. 1"
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
  if (hasSubscription) return true;
  
  // Les utilisateurs non abonnés peuvent uniquement accéder au Chapitre 1 dans la catégorie Cours
  if (isCourseCategory(categoryId) && isChapterOne(fileTitle)) {
    return true;
  }

  // Pour tout autre contenu, l'accès est refusé aux utilisateurs non abonnés
  return false;
};