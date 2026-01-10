import { supabase } from "../lib/supabaseClient";

function qs<T extends Element = Element>(sel: string) {
  return document.querySelector(sel) as T | null;
}

function setText(el: Element | null, t: string) {
  if (el) el.textContent = t;
}

async function init() {
  const id = window.location.pathname.split("/").pop();

  const titleEl = qs<HTMLElement>("#title");
  const dateEl = qs<HTMLElement>("#date");
  const contentEl = qs<HTMLElement>("#content");
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

  if (!id) {
    setText(msgEl, "Missing post id.");
    return;
  }

  const { data: post, error } = await supabase
    .from("posts")
    .select("id, title, content, created_at, user_id")
    .eq("id", id)
    .single();

  if (error || !post) {
    console.error(error);
    setText(msgEl, "Post not found.");
    return;
  }

  const postData = post;

  if (titleEl) titleEl.textContent = postData.title ?? "";
  if (dateEl) dateEl.textContent = new Date(postData.created_at).toLocaleString();
  if (contentEl) contentEl.textContent = postData.content ?? "";

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user ?? null;

  if (user && user.id === postData.user_id && ownerActions && editBtn) {
    ownerActions.style.display = "flex";
    editBtn.href = `/posts/edit/${postData.id}`;
  }

  deleteBtn?.addEventListener("click", async () => {
    if (!confirm("Delete this post? This cannot be undone.")) return;

    setText(msgEl, "Deleting...");

    const { error: delError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postData.id);

    if (delError) {
      console.error(delError);
      setText(msgEl, "Error: " + delError.message);
      return;
    }

    window.location.href = "/posts";
  });

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
      .select("id, content, created_at, user_id")
      .eq("post_id", postData.id)
      .order("created_at", { ascending: true });

    if (cErr) {
      console.error(cErr);
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
        const author = c.user_id === user?.id ? "You" : c.user_id.slice(0, 8);

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
        post_id: postData.id,
        user_id: user.id,
        content,
      });

      if (insErr) {
        console.error(insErr);
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

document.addEventListener("astro:page-load", init);
