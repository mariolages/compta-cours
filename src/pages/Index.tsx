import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#accbee] to-[#e7f0fd]">
      <div className="max-w-3xl w-full space-y-12 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h1 className="text-6xl font-bold text-gray-900 tracking-tight">
            DCGHub
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Votre plateforme pour accéder, partager et organiser vos cours, exercices et corrections dans toutes les matières du DCG.
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
            className="bg-white/90 hover:bg-white text-gray-800 text-lg px-8 py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            S'inscrire
          </Button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
        >
          {[
            {
              title: 'Cours',
              description: 'Accédez à une bibliothèque complète de cours structurés et détaillés.',
              icon: '📚'
            },
            {
              title: 'Exercices',
              description: 'Pratiquez avec des exercices variés pour renforcer vos connaissances.',
              icon: '✏️'
            },
            {
              title: 'Corrections',
              description: 'Comprenez vos erreurs grâce à des corrections détaillées.',
              icon: '✅'
            }
          ].map((feature) => (
            <motion.div
              key={feature.title}
              whileHover={{ scale: 1.03 }}
              className="glass-card p-6 rounded-xl bg-white/80 backdrop-blur-md border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Index;