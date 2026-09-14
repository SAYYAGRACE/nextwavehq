import { motion, useReducedMotion, type Variants } from "motion/react";
import { useRef, type ReactNode, type CSSProperties } from "react";

type KineticTextProps = {
  text: string;
  className?: string;
  once?: boolean;
  duration?: number;
  delay?: number;
};

const wordWrapper: Variants = {
  hidden: {},
  visible: (i: number) => ({
    transition: { delayChildren: i * 0.06, staggerChildren: 0.03 },
  }),
};

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 24, rotateX: 45, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export function KineticText({ text, className, once = true }: KineticTextProps) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  if (reduced) {
    return <span className={className}>{text}</span>;
  }

  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.8 }}
      aria-label={text}
    >
      {words.map((word, wi) => (
        <span key={`${word}-${wi}`} className="inline-block whitespace-nowrap">
          <motion.span className="inline-block" variants={wordWrapper} custom={wi}>
            {word.split("").map((char, ci) => (
              <motion.span
                key={`${char}-${ci}`}
                className="inline-block"
                variants={letterVariants}
                aria-hidden
              >
                {char}
              </motion.span>
            ))}
          </motion.span>
          {wi < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </motion.span>
  );
}