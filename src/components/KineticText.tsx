type KineticTextProps = {
  text: string;
  className?: string;
};

export function KineticText({ text, className }: KineticTextProps) {
  const words = text.split(" ");
  let charIndex = -1;

  return (
    <span className={className} aria-label={text}>
      {words.map((word, wi) => (
        <span key={`${word}-${wi}`} className="inline-block whitespace-nowrap">
          {word.split("").map((char) => {
            charIndex += 1;
            return (
              <span
                key={charIndex}
                className="kt-letter"
                style={{ animationDelay: `${charIndex * 28}ms` }}
                aria-hidden
              >
                {char}
              </span>
            );
          })}
          {wi < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}
