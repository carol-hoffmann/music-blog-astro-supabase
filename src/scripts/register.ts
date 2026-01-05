import { supabase } from "../lib/supabaseClient";


function qs<T extends Element>(sel: string) {
  return document.querySelector(sel) as T | null;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = qs<HTMLFormElement>("#registerForm");
  const msg = qs<HTMLParagraphElement>("#msg");

  const setMsg = (text: string) => {
    if (msg) msg.textContent = text;
  };

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMsg("Creating account...");

    const formData = new FormData(form);

    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const full_name = String(formData.get("full_name") || "");
    const username = String(formData.get("username") || "");
    const favourite_genre = String(formData.get("favourite_genre") || "");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name, username, favourite_genre } },
    });

    if (error) {
      console.error(error);
      setMsg("Error: " + error.message);
      return;
    }

    // Se confirmação de email estiver ligada, session pode vir null
    if (!data.session) {
      setMsg("Account created! Please check your email to confirm, then login.");
      setTimeout(() => (window.location.href = "/login"), 1500);
      return;
    }

    setMsg("Registered! Redirecting...");
    window.location.href = "/account";
  });
});