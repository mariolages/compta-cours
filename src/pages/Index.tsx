import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a365d] to-[#2d3748]">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              DCGHub
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              La plateforme collaborative pour réussir votre DCG
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={() => navigate('/login')}
              className="bg-primary hover:bg-primary-hover text-white text-lg px-8 py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Se connecter
            </Button>
            <Button
              onClick={() => navigate('/register')}
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white text-lg px-8 py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              S'inscrire
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {[
            {
              title: 'Ressources Complètes',
              description: 'Accédez à une bibliothèque exhaustive de cours, exercices et corrections pour toutes les UE du DCG.',
              icon: '📚'
            },
            {
              title: 'Collaboration',
              description: 'Partagez vos connaissances et bénéficiez de l\'expertise de la communauté DCG.',
              icon: '🤝'
            },
            {
              title: 'Organisation Optimale',
              description: 'Retrouvez facilement vos documents grâce à un classement par UE et par type de contenu.',
              icon: '📋'
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              whileHover={{ scale: 1.03 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-white/10"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Statistics Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center"
        >
          {[
            { number: '13', label: 'UE Couvertes' },
            { number: '1000+', label: 'Ressources' },
            { number: '24/7', label: 'Disponibilité' },
            { number: '100%', label: 'Gratuit' }
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 rounded-lg p-6">
              <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
              <div className="text-gray-300">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Index;