import { supabase } from "../lib/supabaseClient";

function qs<T extends Element = Element>(sel: string) {
  return document.querySelector(sel) as T | null;
}

function setText(el: Element | null, t: string) {
  if (el) el.textContent = t || "";
}

async function init() {
  const formEl = qs<HTMLFormElement>("#editForm");
  const msgEl = qs<HTMLElement>("#msg");
  const titleInput = qs<HTMLInputElement>("#title");
  const contentInput = qs<HTMLTextAreaElement>("#content");

  if (!formEl || !titleInput || !contentInput) return;

  const id = formEl.dataset.postId;
  if (!id) {
    setText(msgEl, "Missing post id.");
    return;
  }

  // precisa estar logada
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) {
    window.location.href = "/login";
    return;
  }

  setText(msgEl, "Loading post...");

  const { data: post, error } = await supabase
    .from("posts")
    .select("id, title, content, user_id")
    .eq("id", id)
    .single();

  if (error || !post) {
    console.error(error);
    setText(msgEl, "Post not found.");
    return;
  }

  // só o autor pode editar
  if (userData.user.id !== post.user_id) {
    setText(msgEl, "You are not allowed to edit this post.");
    return;
  }

  titleInput.value = post.title ?? "";
  contentInput.value = post.content ?? "";
  setText(msgEl, "");

  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = String(titleInput.value || "").trim();
    const content = String(contentInput.value || "").trim();

    if (!title || !content) {
      setText(msgEl, "Please fill in title and content.");
      return;
    }

    setText(msgEl, "Saving...");

    // Se sua tabela não tem updated_at, remova essa linha
    const { error: upError } = await supabase
      .from("posts")
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq("id", post.id);

    if (upError) {
      console.error(upError);
      setText(msgEl, "Error: " + upError.message);
      return;
    }

    setText(msgEl, "Saved! Redirecting...");
    setTimeout(() => {
      window.location.href = `/posts/${post.id}`;
    }, 700);
  });
}

document.addEventListener("astro:page-load", init);
if (document.readyState !== "loading") init();
else document.addEventListener("DOMContentLoaded", init);
