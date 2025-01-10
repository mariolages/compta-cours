import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, GraduationCap, Award, Check } from "lucide-react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Index() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Cours détaillés",
      description: "Accédez à des cours complets et structurés"
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: "Préparation aux examens",
      description: "Exercices et corrections pour réussir"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Certification",
      description: "Validez vos compétences"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-white to-white">
      <div className="container mx-auto px-4 py-16 space-y-20">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight">
            Compta-Cours.fr
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
            La plateforme de référence pour réussir vos examens en DCG et BTS-CG
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-8">
            <Button 
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto text-lg py-6 px-8 bg-primary hover:bg-primary-hover transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={() => navigate("/login")}
              variant="secondary"
              className="w-full sm:w-auto text-lg py-6 px-8"
            >
              Se connecter
            </Button>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <h2 className="text-3xl font-bold text-center mb-12">
            Pourquoi choisir Compta-Cours.fr ?
          </h2>
          <div className="space-y-6">
            {[
              "Cours mis à jour régulièrement",
              "Exercices corrigés détaillés",
              "Support pédagogique personnalisé",
              "Préparation optimale aux examens"
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm"
              >
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-8 bg-primary/5 p-12 rounded-2xl"
        >
          <h2 className="text-3xl font-bold">
            Prêt à commencer votre réussite ?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Rejoignez des milliers d'étudiants qui réussissent leurs examens avec Compta-Cours.fr
          </p>
          <Button 
            onClick={() => navigate("/register")}
            className="text-lg py-6 px-8 bg-primary hover:bg-primary-hover transition-all duration-300"
          >
            S'inscrire maintenant
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}