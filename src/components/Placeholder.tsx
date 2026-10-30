export default function Placeholder({ title, text }: { title: string; text: string }) {
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-2">{title}</h1>
      <p className="text-muted">{text}</p>
    </section>
  );
}
