/**
 * Display character count from a textarea
 */

interface CharCountProps {
  max: number;
  min: number;
  count: number;
  className?: string;
};

export default function CharacterCount({
  count,
  max,
  min,
  className = "",
}: CharCountProps){


  const string = (count < min) ? `at least ${min-count} more characters required` : `${count} / ${max}`;


  return (
    <span className={className}>
      {string}
    </span>
  );
};