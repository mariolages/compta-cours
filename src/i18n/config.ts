import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      welcome: {
        title: 'Bienvenue sur Compta-Cours.fr',
        subtitle: 'La plateforme de référence pour réussir vos examens en DCG et BTS-CG',
        cta: 'Commencer gratuitement',
        login: 'Se connecter'
      },
      stats: {
        students: 'Étudiants satisfaits',
        success: 'Taux de réussite',
        resources: 'Ressources disponibles'
      },
      features: {
        courses: {
          title: 'Cours détaillés',
          description: 'Accédez à des cours complets et structurés pour une meilleure compréhension'
        },
        exams: {
          title: 'Préparation aux examens',
          description: 'Exercices et corrections pour maximiser vos chances de réussite'
        },
        certification: {
          title: 'Certification',
          description: 'Validez vos compétences avec nos certifications reconnues'
        }
      }
    }
  },
  en: {
    translation: {
      welcome: {
        title: 'Welcome to Compta-Cours.fr',
        subtitle: 'The reference platform for succeeding in your DCG and BTS-CG exams',
        cta: 'Start for free',
        login: 'Login'
      },
      stats: {
        students: 'Satisfied students',
        success: 'Success rate',
        resources: 'Available resources'
      },
      features: {
        courses: {
          title: 'Detailed courses',
          description: 'Access complete and structured courses for better understanding'
        },
        exams: {
          title: 'Exam preparation',
          description: 'Exercises and corrections to maximize your chances of success'
        },
        certification: {
          title: 'Certification',
          description: 'Validate your skills with our recognized certifications'
        }
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;