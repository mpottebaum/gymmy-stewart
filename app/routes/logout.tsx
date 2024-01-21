import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { destroySession, destroySessionCookie } from "~/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method === "DELETE") {
    await destroySession(request);
    return redirect("/", {
      headers: {
        "Set-Cookie": await destroySessionCookie(),
      },
    });
  }
  return redirect("/");
}
