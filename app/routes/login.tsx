import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Link, json, useActionData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  checkPassword,
  checkSession,
  createSession,
  serializeSessionCookie,
} from "~/auth.server";
import { UserForm } from "~/components/user-form";
import { routes } from "~/constants/shared";
import { db } from "~/db.server";
import { userSchema } from "~/types";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await checkSession(request);
  if (userId) {
    return redirect("/");
  }
  return json({});
}

export default function Login() {
  const [loginError, setLoginError] = useState<string | undefined>();
  const actionData = useActionData<typeof action>();
  useEffect(() => {
    if (actionData && !actionData.ok) {
      setLoginError(actionData.error);
    }
  }, [actionData]);
  return (
    <main>
      <section className="p-2">
        <h1>Log In</h1>
        <p>yo c&apos;mon in the water&apos;s warm here in the Gymmy Stew</p>
        <UserForm
          method="POST"
          type="login"
          onInputsChange={() => setLoginError(undefined)}
        />
      </section>
      <section>
        <Link to={routes.register}>
          <button>
            <p>register</p>
          </button>
        </Link>
      </section>
      {loginError && <section>{loginError}</section>}
    </main>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method === "POST") {
    const formData = await request.formData();
    const username = z.string().parse(formData.get("username"));
    const password = z.string().parse(formData.get("password"));
    const {
      rows: [userRow],
    } = await db.execute({
      sql: "SELECT * FROM users WHERE username = $username",
      args: {
        username,
      },
    });
    if (!userRow) {
      return json({
        ok: false,
        error: "username or password incorrect",
      });
    }
    const user = userSchema.parse(userRow);
    const isPasswordCorrect = await checkPassword(password, user.password_hash);
    if (!isPasswordCorrect) {
      return json({
        ok: false,
        error: "username or password incorrect",
      });
    }
    const session = await createSession(user.id);
    return redirect("/", {
      headers: {
        "Set-Cookie": await serializeSessionCookie(session),
      },
    });
  }
  return json({
    ok: false,
    error: "login: unhandled action",
  });
}
