import LiveCodeRunner from '../components/LiveCodeRunner';

export default function TestPage() {
  return (
    <div className="p-8 bg-zinc-950 min-h-screen text-white">
      <h1 className="text-2xl mb-4">LiveCodeRunner Test</h1>
      <LiveCodeRunner code={'print("Hello World")\nprint(10 ^ 10)'} />
    </div>
  );
}
