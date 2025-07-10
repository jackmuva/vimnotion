import { auth } from '@/auth'

export async function POST(request: Request) {
	const session = await auth();
	console.log(session);
	return Response.json({ hi: "hi" })
}
