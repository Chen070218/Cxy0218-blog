export const runtime = 'edge';
export async function GET() {
  return new Response("Meow! I am reachable!", { status: 200 });
}