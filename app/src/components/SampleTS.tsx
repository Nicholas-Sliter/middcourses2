//sample TypeScript component

import React from "react"; //can't do it without react ;)

type SampleTSProps = {
  title: string;
  paragraph: string;
};

export default function SampleTS({ title, paragraph }: SampleTSProps) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{paragraph}</p>
    </div>
  );
}
