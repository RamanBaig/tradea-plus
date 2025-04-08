import { MotionProps, Variants } from "framer-motion";

export const parallaxVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const buttonVariants: MotionProps = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { type: "spring", stiffness: 400, damping: 17 }
};

export const modernButtonVariants: Variants = {
  initial: { scale: 1 },
  visible: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17
    }
  },
  whileHover: { 
    scale: 1.02,
    y: -2,
    boxShadow: "0 10px 30px rgba(0, 255, 157, 0.2)",
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 17 
    }
  },
  whileTap: { 
    scale: 0.98,
    y: 0,
    boxShadow: "0 5px 15px rgba(59, 130, 246, 0.1)"
  }
};

export const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  }
};

export const parallaxSection = {
  visible: (i = 0) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  }),
  hidden: { y: 20, opacity: 0 }
};

// Add new sophisticated card animation
export const cardVariants: Variants = {
  initial: { 
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      duration: 0.4
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

export const futuristicCardVariants: Variants = {
  initial: { 
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

export const glowButtonVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    boxShadow: "0 0 20px rgba(0, 255, 157, 0.4)",
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.98,
    boxShadow: "0 0 10px rgba(0, 255, 157, 0.2)"
  }
};

export const neonButtonVariants: Variants = {
  initial: { 
    scale: 1,
    boxShadow: "0 0 0 rgba(0, 255, 157, 0)" 
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 0 20px rgba(0, 255, 157, 0.5)",
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.98,
    boxShadow: "0 0 10px rgba(0, 255, 157, 0.3)"
  }
};
