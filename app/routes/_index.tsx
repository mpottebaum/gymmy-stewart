import type { MetaFunction } from "@remix-run/node";
import { v4 as uuid } from "uuid";

export const meta: MetaFunction = () => {
  return [
    { title: "Gymmy Stewart" },
    { name: "description", content: "Get it, Brother" },
  ];
};

const weekDays = [
  { name: "sunday", abbrev: "s" },
  { name: "monday", abbrev: "m" },
  { name: "tuesday", abbrev: "t" },
  { name: "wednesday", abbrev: "w" },
  { name: "thursday", abbrev: "t" },
  { name: "friday", abbrev: "f" },
  { name: "saturday", abbrev: "s" },
];

const months = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

export default function Index() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDate = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0);
  const days = [...new Array(lastDate.getDate())].map((_, i) => ({
    date: i + 1,
    id: uuid(),
  }));
  const firstDay = firstDate.getDay();
  const daysPad = [...new Array(firstDay)].map(() => ({
    id: uuid(),
    date: null,
  }));
  const paddedDays = [...daysPad, ...days];
  return (
    <main className="flex flex-col">
      <section>
        <header className="flex justify-center">
          <h1 className="uppercase">{months[month]}</h1>
        </header>
        <article className="grid grid-cols-7">
          {weekDays.map(({ abbrev, name }) => (
            <h2 key={name} className="uppercase">
              {abbrev}
            </h2>
          ))}
          {paddedDays.map(({ date, id }) => (
            <p key={id}>{date}</p>
          ))}
        </article>
      </section>
    </main>
  );
}
