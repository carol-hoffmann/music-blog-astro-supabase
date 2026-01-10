import { supabase } from "../lib/supabaseClient";

function qs<T extends Element = Element>(sel: string) {
  return document.querySelector(sel) as T | null;
}

function setText(el: Element | null, t: string) {
  if (el) el.textContent = t;
}

async function init() {
  console.log("postPage.ts rodou ✅");

  const postRoot =
    qs<HTMLElement>('article[data-post-id]') || qs<HTMLElement>("[data-post-id]");

  const postId = postRoot?.dataset.postId;
  const postUserId = postRoot?.dataset.postUserId;

  console.log("postId:", postId);
  console.log("postUserId:", postUserId);

  const msgEl = qs<HTMLElement>("#msg");

  const ownerActions = qs<HTMLElement>("#ownerActions");
  const editBtn = qs<HTMLAnchorElement>("#editBtn");
  const deleteBtn = qs<HTMLButtonElement>("#deleteBtn");

  const commentsWrap = qs<HTMLElement>("#commentsWrap");
  const commentsMsg = qs<HTMLElement>("#commentsMsg");

  const commentBox = qs<HTMLElement>("#commentBox");
  const commentLoginMsg = qs<HTMLElement>("#commentLoginMsg");
  const commentForm = qs<HTMLFormElement>("#commentForm");
  const commentFormMsg = qs<HTMLElement>("#commentFormMsg");

  if (!postId) {
    setText(msgEl, "Erro: não achei o post id na página (data-post-id).");
    setText(commentsMsg, "Erro: post id não encontrado.");
    return;
  }

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) console.error("auth.getUser error:", userErr);

  const user = userData?.user ?? null;

  // ações do dono
  if (user && postUserId && user.id === postUserId) {
    if (ownerActions) ownerActions.style.display = "flex";
    if (editBtn) editBtn.href = `/posts/edit/${postId}`;
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      if (!confirm("Delete this post? This cannot be undone.")) return;

      setText(msgEl, "Deleting...");

      const { error: delError } = await supabase.from("posts").delete().eq("id", postId);

      if (delError) {
        console.error(delError);
        setText(msgEl, "Error: " + delError.message);
        return;
      }

      window.location.href = "/posts";
    });
  }

  // mostrar form de comment
  if (user) {
    if (commentBox) commentBox.style.display = "block";
    if (commentLoginMsg) commentLoginMsg.style.display = "none";
  } else {
    if (commentBox) commentBox.style.display = "none";
    if (commentLoginMsg) commentLoginMsg.style.display = "block";
  }

  async function loadComments() {
    setText(commentsMsg, "Loading comments...");

    const { data: comments, error: cErr } = await supabase
      .from("comments")
      .select("id, post_id, content, created_at, user_id")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    console.log("comments:", comments);
    console.log("comments error:", cErr);

    if (cErr) {
      setText(commentsMsg, "Error loading comments: " + cErr.message);
      return;
    }

    if (!comments || comments.length === 0) {
      setText(commentsMsg, "No comments yet.");
      return;
    }

    commentsMsg?.remove();

    const html = comments
      .map((c) => {
        const date = new Date(c.created_at).toLocaleString();
        const author = c.user_id === user?.id ? "You" : String(c.user_id).slice(0, 8);

        return `
          <div class="comment-item">
            <div class="comment-meta">
              <strong>${author}</strong> · ${date}
            </div>
            <div class="comment-text">${c.content}</div>
          </div>
        `;
      })
      .join("");

    if (commentsWrap) commentsWrap.innerHTML = html;
  }

  await loadComments();

  if (user && commentForm) {
    commentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      setText(commentFormMsg, "Posting...");

      const fd = new FormData(commentForm);
      const content = String(fd.get("content") || "").trim();

      if (!content) {
        setText(commentFormMsg, "Please write a comment.");
        return;
      }

      const { error: insErr } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: user.id,
        content,
      });

      console.log("insert error:", insErr);

      if (insErr) {
        setText(commentFormMsg, "Error: " + insErr.message);
        return;
      }

      commentForm.reset();
      setText(commentFormMsg, "Posted!");
      setTimeout(() => setText(commentFormMsg, ""), 900);

      await loadComments();
    });
  }
}

// Astro navegação + fallback
document.addEventListener("astro:page-load", init);
if (document.readyState !== "loading") init();
else document.addEventListener("DOMContentLoaded", init);
