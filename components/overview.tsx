import { motion } from 'framer-motion';
import { MessageIcon } from './ui/icons';

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.1, duration: 0.3 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl mx-auto">
        <div className="flex justify-center">
          <MessageIcon size={32} />
        </div>
        <h1 className="text-2xl font-bold">Welcome to Chatrock.js!</h1>
        <p className="text-muted-foreground">
          Say hello to your new AI assistant! Chatrock.js is here to help—whether you’ve got questions, need ideas, or
          just want to chat.
        </p>
        <p className="text-muted-foreground">
          Just type your message below and hit Enter. It’s that simple. Let’s get started!
        </p>
      </div>
    </motion.div>
  );
};
