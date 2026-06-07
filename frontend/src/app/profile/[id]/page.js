/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Edit3, ImagePlus, MessageCircle, Trash2, UserRound } from "lucide-react";
import { chatApi, uploadApi, usersApi } from "@/lib/api";

const fallbackAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=0d9488&color=fff`;

const fmtDate = (value) => (value ? new Date(value).toLocaleDateString("vi-VN") : "");

const roleLabel = {
  ADMIN: "Quản trị viên",
  OWNER: "Chủ dịch vụ",
  USER: "Thành viên",
};

export default function PublicProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [viewer, setViewer] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [postForm, setPostForm] = useState({ content: "", images: [] });
  const [editingPostId, setEditingPostId] = useState(null);
  const [toast, setToast] = useState("");

  const isMe = viewer?.id && profile?.user?.id && viewer.id === profile.user.id;

  const servicePosts = useMemo(() => profile?.servicePosts || [], [profile]);
  const personalPosts = useMemo(() => profile?.posts || [], [profile]);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const loadProfile = async () => {
    const data = await usersApi.getPublicProfile(id);
    setProfile(data);
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setViewer(JSON.parse(stored));
      } catch {
        setViewer(null);
      }
    }

    setLoading(true);
    loadProfile()
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [id]);

  const resetComposer = () => {
    setPostForm({ content: "", images: [] });
    setEditingPostId(null);
  };

  const addImage = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setSaving(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const result = await uploadApi.uploadImage(file);
        if (result.url) uploaded.push(result.url);
      }
      setPostForm((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
    } catch (error) {
      notify(error.message || "Không thể tải ảnh");
    } finally {
      setSaving(false);
      event.target.value = "";
    }
  };

  const removeImage = (url) => {
    setPostForm((prev) => ({ ...prev, images: prev.images.filter((item) => item !== url) }));
  };

  const submitPost = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingPostId) {
        await usersApi.updatePost(editingPostId, postForm);
        notify("Đã cập nhật bài đăng");
      } else {
        await usersApi.createPost(postForm);
        notify("Đã đăng bài");
      }
      resetComposer();
      await loadProfile();
    } catch (error) {
      notify(error.message || "Không thể lưu bài đăng");
    } finally {
      setSaving(false);
    }
  };

  const editPost = (post) => {
    setEditingPostId(post.id);
    setPostForm({
      content: post.content || "",
      images: Array.isArray(post.images) ? post.images : [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Xoá bài đăng này?")) return;
    setSaving(true);
    try {
      await usersApi.deletePost(postId);
      notify("Đã xoá bài đăng");
      if (editingPostId === postId) resetComposer();
      await loadProfile();
    } catch (error) {
      notify(error.message || "Không thể xoá bài đăng");
    } finally {
      setSaving(false);
    }
  };

  const startChat = async () => {
    if (!profile?.user?.id || isMe) return;
    if (!viewer?.id) {
      router.push(`/login?redirect=/profile/${profile.user.id}`);
      return;
    }
    try {
      const conversation = await chatApi.createConversation(profile.user.id);
      router.push(`/chat?conversationId=${conversation.id}`);
    } catch (error) {
      notify(error.message || "Không thể mở tin nhắn");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
        <Navbar theme="light" />
        <div style={{ height: 72 }} />
        <main style={{ padding: 60, textAlign: "center", fontWeight: 800, color: "#64748b" }}>Đang tải hồ sơ...</main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
        <Navbar theme="light" />
        <div style={{ height: 72 }} />
        <main style={{ padding: 60, textAlign: "center" }}>
          <h1 style={{ color: "#0f172a" }}>Không tìm thấy hồ sơ</h1>
          <Link href="/blog" style={{ color: "#0d9488", fontWeight: 800 }}>Quay lại blog</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const user = profile.user;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar theme="light" />
      <div style={{ height: 72 }} />
      <style>{`
        .profile-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 28px;
          align-items: start;
        }
        .profile-hero-body {
          padding: 0 32px 32px;
          display: flex;
          gap: 24px;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
        }
        .profile-hero-person {
          display: flex;
          gap: 22px;
          align-items: flex-end;
          margin-top: -54px;
        }
        @media (max-width: 900px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
          .profile-hero-body {
            align-items: flex-start;
          }
        }
        @media (max-width: 640px) {
          .profile-hero-body {
            padding: 0 20px 24px;
          }
          .profile-hero-person {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 20px 80px" }}>
        <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 24, overflow: "hidden", marginBottom: 28 }}>
          <div style={{ height: 210, background: "linear-gradient(135deg, #0f766e 0%, #0891b2 55%, #f59e0b 100%)" }} />
          <div className="profile-hero-body">
            <div className="profile-hero-person">
              <img
                src={user.avatar || fallbackAvatar(user.name)}
                alt={user.name || "User"}
                style={{ width: 124, height: 124, borderRadius: "50%", objectFit: "cover", border: "6px solid #fff", boxShadow: "0 12px 30px rgba(15,23,42,0.18)" }}
              />
              <div style={{ paddingBottom: 8 }}>
                <h1 style={{ margin: "0 0 8px", fontSize: 32, lineHeight: 1.15, color: "#0f172a", fontWeight: 900 }}>{user.name || "Người dùng"}</h1>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "6px 12px", borderRadius: 999, background: "#f0fdfa", color: "#0d9488", fontSize: 13, fontWeight: 800 }}>
                    <UserRound size={14} /> {roleLabel[user.role] || user.role}
                  </span>
                  <span style={{ color: "#64748b", fontSize: 14, fontWeight: 700 }}>Tham gia {fmtDate(user.createdAt)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {isMe ? (
                <>
                  <Link href="/dashboard" style={secondaryButtonStyle}>Chỉnh sửa hồ sơ</Link>
                  <Link href="/owner" style={primaryButtonStyle}>Owner Center</Link>
                </>
              ) : (
                <button onClick={startChat} style={primaryButtonStyle}>
                  <MessageCircle size={17} /> Nhắn tin
                </button>
              )}
            </div>
          </div>
        </section>

        <div className="profile-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {isMe && (
              <PostComposer
                form={postForm}
                saving={saving}
                editing={Boolean(editingPostId)}
                onChange={setPostForm}
                onSubmit={submitPost}
                onCancel={resetComposer}
                onAddImage={addImage}
                onRemoveImage={removeImage}
              />
            )}

            <section style={panelStyle}>
              <h2 style={panelTitleStyle}>Bài đăng cá nhân</h2>
              {personalPosts.length === 0 ? (
                <EmptyState text={isMe ? "Bạn chưa có bài đăng nào." : "Người dùng này chưa có bài đăng cá nhân."} />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {personalPosts.map((post) => (
                    <PostCard key={post.id} post={post} author={user} canEdit={isMe} onEdit={editPost} onDelete={deletePost} />
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <section style={panelStyle}>
              <h2 style={panelTitleStyle}>Tổng quan</h2>
              <div style={{ display: "grid", gap: 12 }}>
                <StatRow label="Bài đăng cá nhân" value={profile.stats.postsCount} />
                <StatRow label="Bài viết/dịch vụ" value={profile.stats.servicePostsCount} />
                <StatRow label="Đánh giá đã viết" value={profile.stats.reviewsCount} />
              </div>
            </section>

            <section style={panelStyle}>
              <h2 style={panelTitleStyle}>Bài viết & dịch vụ</h2>
              {servicePosts.length === 0 ? (
                <EmptyState text="Chưa có bài viết hoặc dịch vụ công khai." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {servicePosts.map((item) => (
                    <Link key={item.id} href={item.href} style={{ textDecoration: "none", color: "inherit", display: "grid", gridTemplateColumns: "76px 1fr", gap: 12 }}>
                      <img src={item.coverImage} alt={item.title} style={{ width: 76, height: 64, objectFit: "cover", borderRadius: 12 }} />
                      <div>
                        <div style={{ fontSize: 12, color: "#0d9488", fontWeight: 900, marginBottom: 4 }}>{item.category}</div>
                        <div style={{ fontSize: 14, color: "#0f172a", fontWeight: 850, lineHeight: 1.35 }}>{item.title}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      </main>

      <Footer />
      {toast && <div style={toastStyle}>{toast}</div>}
    </div>
  );
}

function PostComposer({ form, saving, editing, onChange, onSubmit, onCancel, onAddImage, onRemoveImage }) {
  return (
    <section style={panelStyle}>
      <h2 style={panelTitleStyle}>{editing ? "Chỉnh sửa bài đăng" : "Tạo bài đăng"}</h2>
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <textarea
          value={form.content}
          onChange={(event) => onChange((prev) => ({ ...prev, content: event.target.value }))}
          placeholder="Bạn muốn chia sẻ điều gì?"
          style={{ width: "100%", minHeight: 120, padding: 16, borderRadius: 14, border: "1px solid #e2e8f0", resize: "vertical", outline: "none", fontSize: 15, lineHeight: 1.6 }}
        />
        {form.images.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
            {form.images.map((url) => (
              <div key={url} style={{ position: "relative" }}>
                <img src={url} alt="" style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", borderRadius: 12 }} />
                <button type="button" onClick={() => onRemoveImage(url)} style={imageRemoveStyle}>×</button>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <label style={secondaryButtonStyle}>
            <ImagePlus size={16} /> Thêm ảnh
            <input type="file" accept="image/*" multiple hidden onChange={onAddImage} />
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            {editing && (
              <button type="button" onClick={onCancel} style={secondaryButtonStyle}>Huỷ</button>
            )}
            <button type="submit" disabled={saving} style={primaryButtonStyle}>
              {saving ? "Đang lưu..." : editing ? "Lưu bài" : "Đăng bài"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

function PostCard({ post, author, canEdit, onEdit, onDelete }) {
  const images = Array.isArray(post.images) ? post.images : [];
  return (
    <article style={{ border: "1px solid #e2e8f0", borderRadius: 18, overflow: "hidden", background: "#fff" }}>
      <div style={{ padding: 18, display: "flex", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <img src={author.avatar || fallbackAvatar(author.name)} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
          <div>
            <div style={{ fontWeight: 900, color: "#0f172a" }}>{author.name || "Người dùng"}</div>
            <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 700 }}>{fmtDate(post.createdAt)}</div>
          </div>
        </div>
        {canEdit && (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onEdit(post)} style={iconButtonStyle} title="Sửa"><Edit3 size={15} /></button>
            <button onClick={() => onDelete(post.id)} style={dangerIconButtonStyle} title="Xoá"><Trash2 size={15} /></button>
          </div>
        )}
      </div>
      {post.content && <p style={{ margin: 0, padding: "0 18px 18px", color: "#334155", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{post.content}</p>}
      {images.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: images.length === 1 ? "1fr" : "1fr 1fr", gap: 4 }}>
          {images.map((url) => <img key={url} src={url} alt="" style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover" }} />)}
        </div>
      )}
    </article>
  );
}

function StatRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ color: "#64748b", fontWeight: 700 }}>{label}</span>
      <span style={{ color: "#0f172a", fontWeight: 900 }}>{value}</span>
    </div>
  );
}

function EmptyState({ text }) {
  return <div style={{ padding: 28, textAlign: "center", color: "#94a3b8", fontWeight: 700, background: "#f8fafc", borderRadius: 16 }}>{text}</div>;
}

const panelStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 20,
  padding: 22,
  boxShadow: "0 10px 28px rgba(15,23,42,0.04)",
};

const panelTitleStyle = {
  margin: "0 0 18px",
  color: "#0f172a",
  fontSize: 20,
  fontWeight: 900,
};

const primaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  border: "none",
  borderRadius: 12,
  background: "#0d9488",
  color: "#fff",
  padding: "12px 18px",
  fontWeight: 850,
  cursor: "pointer",
  textDecoration: "none",
};

const secondaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  border: "1px solid #dbe4ee",
  borderRadius: 12,
  background: "#fff",
  color: "#0f172a",
  padding: "12px 18px",
  fontWeight: 850,
  cursor: "pointer",
  textDecoration: "none",
};

const iconButtonStyle = {
  width: 34,
  height: 34,
  borderRadius: 10,
  border: "1px solid #dbe4ee",
  background: "#fff",
  color: "#475569",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const dangerIconButtonStyle = {
  ...iconButtonStyle,
  color: "#dc2626",
  borderColor: "#fecaca",
  background: "#fff5f5",
};

const imageRemoveStyle = {
  position: "absolute",
  top: 6,
  right: 6,
  width: 26,
  height: 26,
  border: "none",
  borderRadius: "50%",
  background: "rgba(15,23,42,0.75)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 900,
};

const toastStyle = {
  position: "fixed",
  right: 20,
  bottom: 20,
  background: "#0f172a",
  color: "#fff",
  padding: "12px 16px",
  borderRadius: 12,
  fontWeight: 800,
  boxShadow: "0 12px 32px rgba(15,23,42,0.24)",
};
