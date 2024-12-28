export const generateQuestions = (text: string) => {
  // Diviser le texte en paragraphes significatifs
  const paragraphs = text
    .split(/\n\n+/)
    .filter(p => p.trim().length > 100)
    .map(p => p.trim());

  // Générer des questions variées pour chaque paragraphe
  const questions = paragraphs.slice(0, 5).map((paragraph, index) => {
    const questionTypes = [
      "Quelle est la principale idée présentée dans ce passage : ",
      "Que signifie le concept suivant : ",
      "Quel est le point clé abordé dans : ",
      "Comment peut-on expliquer : ",
      "Quelle est la définition de : "
    ];

    // Extraire une phrase clé du paragraphe
    const keyPhrase = paragraph.split('.')[0];
    const questionType = questionTypes[index % questionTypes.length];
    const question = `${questionType}"${keyPhrase.slice(0, 100)}..." ?`;

    // Générer des réponses plausibles
    const correctAnswer = paragraph.split('.')[1]?.trim() || "La réponse correcte basée sur le contenu";
    const incorrectAnswers = [
      "Une réponse incorrecte mais plausible",
      "Une autre interprétation possible mais inexacte",
      "Une réponse qui semble correcte mais ne l'est pas"
    ];

    return {
      question,
      correct_answer: correctAnswer,
      options: JSON.stringify([correctAnswer, ...incorrectAnswers])
    };
  });

  return questions;
};